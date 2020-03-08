/** @module fe-server */

import Koa from 'koa'
import render from 'koa-ejs'
import Router from '@koa/router'
import logger from 'koa-logger'
import path from 'path'
import fetch from 'node-fetch'
import { account } from './account'
import { exportKey, useRemotes, addressFromKey } from './util'
import { txQueue } from './miner'
import { fePort, centralPort, centralInterval, isDev, apiPort, charPerTx } from './consts'
import { chainData, getUsableTx, getLongestChain } from './chain'
import Transaction from './transaction'

export let central, remotes = []
let intervalId = null

const app = new Koa()
const router = new Router()

render(app, {
  root: path.resolve(__dirname, 'view'),
  async: true,
  viewExt: 'ejs',
})

// setup central server fetch
const setupCentral = async () => {
  await updateCentral()
  intervalId = setInterval(updateCentral, centralInterval)
}

// update peers from central
const updateCentral = async () => {
  try {
    await fetch(new URL('/join', central)).then(res => res.json())
    if (isDev && apiPort !== 34992) await fetch(new URL('/join/' + apiPort, central)).then(res => res.json())
    remotes = await fetch(new URL('/remotes', central)).then(res => res.json())
  } catch (e) {
    console.log('[ERROR] fetching from central: ' + e)
    central = null
    clearInterval(intervalId)
  }
}

// The entries below could be quite obviously understood by running a FE server,
// so they are not documented.

router.get('/', async ctx => {
  if(central) ctx.redirect('/stats')
  await ctx.render('index', {title: 'Home'})
})

router.get('/set-central', async ctx => {
  if(!ctx.query.central) {
    ctx.redirect('/')
    return
  }
  const url = new URL('http://localhost:8080/')
  url.host = ctx.query.central
  url.port = centralPort
  try {
    const res = await fetch(new URL('/status', url)).then(res => res.json())
    if(res.status !== 0) throw 'Invalid'
  } catch {
    ctx.redirect('/')
    return
  }
  central = url
  await setupCentral()
  ctx.redirect('/stats')
})

router.get('/stats', async ctx => {
  if(!central) return ctx.redirect('/')
  const key = exportKey(account.pub)
  await ctx.render('stats', {
    title: 'Stats',
    remotes,
    account: key,
    address: addressFromKey(key),
    chainData,
    usableTxLength: getUsableTx().length,
    longestChain: getLongestChain(),
    useRefresh: true,
    txQueue,
  })
})

router.get('/block/:id', async ctx => {
  await ctx.render('block', {
    title: `Block #${ctx.params.id}`,
    block: chainData[ctx.params.id].toShowObject(),
  })
})

router.get('/account/:account', async ctx => {
  const account = ctx.params.account
  const address = addressFromKey(account)
  await ctx.render('account', {
    title: `Address ${address}`,
    account,
    address,
    blocks: Object.values(chainData).filter(block => block.account === account),
    longestChain: getLongestChain(),
    chainData,
  })
})

router.get('/send-transaction', async ctx => {
  const data = ctx.query.data
  if (typeof data !== 'string' || data.length === 0 || Buffer.from(data).length > charPerTx) {
    return ctx.body = 'Message too long, maxlength = 16 bytes'
  }
  const { block, txCount } = getUsableTx()[0]
  const tx = Transaction.create({ blockId: block.id, txCount, data })
  txQueue.push(tx)
  const txStr = JSON.stringify(tx.toObject())
  await useRemotes(async remoteBase => {
    try {
      const res = await fetch(new URL('/tx', remoteBase), {
        method: 'post',
        body: txStr,
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(res => res.json())
      if(res.status !== 0) throw res.message || JSON.stringify(res)
    } catch (e) {
      console.log('[WARN] error sending tx to remote: ' + e)
    }
  })
  ctx.redirect('/stats')
})

app.use(logger())
app.use(router.routes()).use(router.allowedMethods())

if (!isDev) {
  app.listen(fePort, '127.0.0.1')
  console.log(`[INFO] FE server starting on http://localhost:${fePort}/`)
} else {
  central = new URL('http://127.0.0.1:34993/')
  setupCentral()
}
