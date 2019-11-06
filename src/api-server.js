import Koa from 'koa'
import bodyParser from 'koa-body'
import Router from '@koa/router'
import fetch from 'node-fetch'
import { apiPort, fePort, syncInterval, apiHost } from './consts'
import { chainData, addBlock } from './chain'
import Block from './block'
import Transaction from './transaction'
import { txQueue } from './miner'
import { useRemotes } from './util'

const app = new Koa()
const router = new Router()

router.get('/', ctx => ctx.redirect(`http://localhost:${fePort}/`))
router.get('/status', ctx => ctx.body = { status: 0 })

router.get('/blocks', ctx => ctx.body = Object.keys(chainData))
router.get('/block/:id', ctx => ctx.body = chainData[ctx.params.id].toObject())

router.post('/tx', bodyParser(), ctx => {
  const txObj = ctx.request.body
  try {
    const tx = new Transaction(txObj)
    if (!tx.validateNew() || txQueue.some(tx1 => tx.id === tx1.id)) {
      return ctx.body = {
        status: 1,
        message: 'Tx already in database.',
      }
    }
    txQueue.push(tx)
    return ctx.body = {
      status: 0,
    }
  } catch (e) {
    console.log('[ERROR] Error creating transaction: ' + e)
  }
})

setInterval(async () => {
  await useRemotes(async remoteBase => {
    try {
      const blocks = await fetch(new URL('/blocks', remoteBase)).then(res => res.json())
      for (let blockId of blocks) {
        if (blockId in chainData) continue
        const blockObj = await fetch(new URL('/block/' + blockId, remoteBase)).then(res => res.json())
        delete blockObj.id
        delete blockObj.height
        delete blockObj.isGenesis
        blockObj.data = blockObj.data.map(txObj => new Transaction(txObj))
        addBlock(new Block(blockObj))
      }
    } catch (e) {
      console.log('[ERROR] Sync error: ' + e)
    }
  })
}, syncInterval)

app.use(router.routes()).use(router.allowedMethods())
app.listen(apiPort, apiHost)
console.log(`[INFO] API server starting on http://${apiHost}:${apiPort}/`)
