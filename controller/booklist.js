const Router = require('koa-router')
const callCloudFn = require('../utils/callCloudFn')
const callCloudDb = require('../utils/callCloudDB')
const router = new Router()

router.get('/list', async (ctx, next) => {
  const query = ctx.request.query
  const res = await callCloudFn(ctx, 'books', {
    $url: 'booklist',
    start: parseInt(query.start),
    count: parseInt(query.count)
  })
  const { errcode, resp_data } = res.data
  if (errcode === 0) {
    const data = JSON.parse(resp_data).data
    return ctx.body = {data, code: 20000}
  } else {
    return ctx.body = {data: '请求失败', code: 0}
  }
})

router.get('/getById', async (ctx, next) => {
  const query = `db.collection('booklist').doc('${ctx.request.query.id}').get()`
  const res = await callCloudDb(ctx, 'databasequery', query)
  
  ctx.body = {
    code: 20000,
    data: JSON.parse(res.data.data[0])
  }
})

router.get('/del', async (ctx, next) => {
  const params = ctx.request.query
  const query = `db.collection('booklist').doc('${params.id}').remove()`
  const res = await callCloudDb(ctx, 'databasedelete', query)
  ctx.body = {
    code: 20000,
    data: res.data
  }
})

router.post('/updateBooklist', async (ctx, next) => {
  const params = ctx.request.body
  const query = `
    db.collection('booklist').doc('${params._id}').update({
      data: {
        name: '${params.name}',
        copywriter: '${params.copywriter}'
      }
    })
  `
  const res = await callCloudDb(ctx, 'databaseupdate', query)
  console.log('res', res)
  ctx.body = {
    code: 20000,
    data: res.data
  }

})

module.exports = router