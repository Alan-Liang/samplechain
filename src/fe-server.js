import Koa from 'koa'
import render from 'koa-ejs'
import Router from '@koa/router'
import logger from 'koa-logger'
import path from 'path'
import fetch from 'node-fetch'
import { account } from './account'
import { exportKey } from './util'
import { start as startMining } from './miner'
import { fePort, centralPort, centralInterval } from './consts'
import { chainData } from './chain'

startMining(10)

export let central, remotes = []
let intervalId = null

const app = new Koa()
const router = new Router()

render(app, {
  root: path.resolve(__dirname, 'view'),
  async: true,
  viewExt: 'ejs',
})

const setupCentral = async () => {
  await updateCentral()
  intervalId = setInterval(updateCentral, centralInterval)
}

const updateCentral = async () => {
  try {
    await fetch(new URL('/join', central)).then(res => res.json())
    remotes = await fetch(new URL('/remotes', central)).then(res => res.json())
  } catch (e) {
    console.log('[ERROR] fetching from central: ' + e)
    central = null
    clearInterval(intervalId)
  }
}

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
  await ctx.render('stats', {
    title: 'Stats',
    remotes,
    account: exportKey(account.pub),
    chainData,
  })
})

router.get('/block/:id', async ctx => {
  await ctx.render('block', {
    title: `Block #${ctx.params.id}`,
    block: chainData[ctx.params.id].toObject(),
  })
})

app.use(logger())
app.use(router.routes()).use(router.allowedMethods())

app.listen(fePort, '127.0.0.1')
console.log(`[INFO] FE server starting on http://localhost:${fePort}/`)
