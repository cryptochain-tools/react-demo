// server.js  (ESM 写法)
import Koa from 'koa'
import serve from 'koa-static'
import send from 'koa-send'
import compress from 'koa-compress'
import path from 'path'
import { fileURLToPath } from 'url'

// ---- 解决 ESM 中没有 __dirname ----
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ---- 静态资源目录 ----
const staticDir = path.resolve(__dirname, 'dist')
const indexFile = 'index.html'

const app = new Koa()

// ---- 开启压缩 (gzip / br) ----
app.use(compress({ br: true, gzip: true }))

// ---- 静态资源，根据文件类型设置缓存 ----
app.use(
  serve(staticDir, {
    maxage: 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        // HTML 30s
        res.setHeader('Cache-Control', 'public, max-age=30')
      } else {
        // 其他静态资源 1 年
        const oneYear = 60 * 60 * 24 * 365
        res.setHeader('Cache-Control', `public, max-age=${oneYear}, immutable`)
      }
    },
    index: indexFile,
  })
)

// ---- SPA Fallback ----
// 对 GET 请求，排除 /api 和静态资源(含'.')，Accept 包含 text/html 时回退 index.html
app.use(async (ctx, next) => {
  if (
    ctx.method === 'GET' &&
    !ctx.path.startsWith('/api') &&
    !ctx.path.includes('.') &&
    (ctx.get('accept') || '').includes('text/html')
  ) {
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
})

const port = process.env.PORT || 7002
app.listen(port, () => {
  console.log(`🚀 SPA static server running at http://localhost:${port}`)
  console.log(`📁 Serving files from: ${staticDir}`)
})