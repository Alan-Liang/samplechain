import Koa from 'koa'
import Router from '@koa/router'
import logger from 'koa-logger'

const port = 34993
const maxAllowance = 30 * 1000 // 30s

const app = new Koa()
const router = new Router()

let remotes = []

router.get('/', ctx => ctx.body = 'Hello. This port is not intended to be used by humans.')
router.get('/status', ctx => ctx.body = { status: 0 })

router.get('/join', ctx => {
  if(!remotes.map(r => r.ip).includes(ctx.ip)) {
    remotes.push({
      ip: ctx.ip,
      joinTime: Date.now(),
      updateTime: Date.now(),
    })
  } else {
    remotes.find(r => r.ip === ctx.ip).updateTime = Date.now()
  }
  ctx.body = { status: 0 }
})

// for debugging purpose
router.get('/join/:port', ctx => {
  if(!remotes.map(r => r.ip).includes(ctx.params.port)) {
    remotes.push({
      ip: ctx.params.port,
      joinTime: Date.now(),
      updateTime: Date.now(),
    })
  } else {
    remotes.find(r => r.ip === ctx.params.port).updateTime = Date.now()
  }
  ctx.body = { status: 0 }
})

router.get('/remotes', ctx => {
  ctx.body = remotes.map(r => r.ip).filter(r => r !== ctx.ip)
})

setInterval(() => {
  const now = Date.now()
  remotes = remotes.filter(r => r.updateTime + maxAllowance > now)
}, 1000)

app.use(logger())
app.use(router.routes()).use(router.allowedMethods())

app.listen(port, '0.0.0.0')
