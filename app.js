const Koa = require('koa')

const app = new Koa()
const Router = require('koa-router')
const router = new Router
const cors = require('koa2-cors')
const { koaBody } = require('koa-body')

const env = 'cloud1-4glau5n8dba75155'


const booklist = require('./controller/booklist')
const swiper = require('./controller/swiper')
const tradeinfo = require('./controller/tradeinfo.js')

app.use(cors({
  origin: ['http://localhost:9528'],
  credentials: true
}))

app.use(async (ctx, next) => {
  console.log('全局中间件')
  ctx.state.env = env
  await next()
})

// 接收post参数解析
app.use(koaBody({
  multipart: true
}))

router.use('/booklist', booklist.routes())
router.use('/swiper', swiper.routes())
router.use('/tradeinfo', tradeinfo.routes())

app.use(router.routes())
app.use(router.allowedMethods())


app.listen(3001, () => {
  console.log('服务开启在3001端口')
})