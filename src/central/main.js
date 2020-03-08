import Koa from 'koa'
import Router from '@koa/router'
import logger from 'koa-logger'
import serve from 'koa-static'

const port = 34993
const maxAllowance = 20 * 1000 // 20s

const app = new Koa()
const router = new Router()

let remotes = []

const downloadHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Downloads</title>
</head>
<body>
  <ul>
    <li><a href="/dist/samplechain-win.zip">Windows</a></li>
    <li><a href="/dist/samplechain-macos.zip">Mac OS</a></li>
    <li><a href="/dist/samplechain-linux.tgz">Linux</a></li>
    <li><a href="https://github.com/Alan-Liang/samplechain/">Source code</a></li>
  </ul>
</body>
</html>
`

router.get('/', ctx => ctx.body = downloadHtml)
router.get('/status', ctx => ctx.body = { status: 0 })

// joins the network
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

// gets all the endpoints
router.get('/remotes', ctx => {
  ctx.body = remotes.map(r => r.ip).filter(r => r !== ctx.ip)
})

// distribute built files
router.get('/dist/:file', serve(__dirname + '/../..'))

// clean up dead endpoints
setInterval(() => {
  const now = Date.now()
  remotes = remotes.filter(r => r.updateTime + maxAllowance > now)
}, 1000)

app.use(logger())
app.use(router.routes()).use(router.allowedMethods())

app.listen(port, '0.0.0.0')
