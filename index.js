// server.js (ESM)
import Koa from 'koa'
import serve from 'koa-static'
import send from 'koa-send'
import compress from 'koa-compress'
import mount from 'koa-mount'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const staticDir = path.resolve(__dirname, 'dist')
const indexFile = 'index.html'

const app = new Koa()

// ---- 日志中间件 ----
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} -> ${ctx.status} (${ms}ms)`)
})

// ---- 压缩 ----
app.use(compress({ br: true, gzip: true }))

// ---- 静态资源挂在 /demo 下 ----
app.use(
  mount(
    '/demo',
    serve(staticDir, {
      maxage: 0,
      setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=30')
        } else {
          const oneYear = 60 * 60 * 24 * 365
          res.setHeader('Cache-Control', `public, max-age=${oneYear}, immutable`)
        }
      },
      index: indexFile,
    })
  )
)

// ---- SPA Fallback ----
app.use(async (ctx, next) => {
  if (
    ctx.method === 'GET' &&
    ctx.path.startsWith('/demo') &&
    !ctx.path.includes('.') &&
    (ctx.get('accept') || '').includes('text/html')
  ) {
    console.log(`SPA fallback -> ${ctx.path}`)
    await send(ctx, indexFile, { root: staticDir })
    ctx.set('Cache-Control', 'public, max-age=30')
    return
  }
  await next()
})

// ---- 兜底 404 ----
app.use(async (ctx) => {
  ctx.status = 404
  ctx.body = 'Not Found'
  console.warn(`404 Not Found -> ${ctx.path}`)
})

const port = process.env.PORT || 7002
app.listen(port, () => {
  console.log(`🚀 SPA static server running at http://localhost:${port}/demo`)
  console.log(`📁 Serving files from: ${staticDir}`)
})