const Router = require('koa-router')
const callCloudDb = require('../utils/callCloudDB')
const callCloudFn = require('../utils/callCloudFn')
const callCloudStorage = require('../utils/callCloudStorage')
const router = new Router()

router.get('/list', async (ctx, next) => {
  const query = ctx.request.query
  const res = await callCloudFn(ctx, 'tradeInfo', {
    $url: 'list',
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


router.post('/del', async (ctx, next) => {
  const params = ctx.request.body
  // 删除tradeInfo
  const queryTreadeInfo = `db.collection('trade-infomation').doc('${params._id}').remove()`
  const delTradeInfoRes = await callCloudDb(ctx, 'databasedelete', queryTreadeInfo)
  // 删除comment  多条删除
  const queryComment = `db.collection('trade-comment').where({
    tradeId: '${params._id}'
  }).remove()`
  const delCommentRes = await callCloudDb(ctx, 'databasedelete', queryComment)
  // 删除图片
  const delImgs = await callCloudStorage.delete(ctx, params.imgs)
  ctx.body = {
    code: 20000,
    data: {
      delTradeInfoRes: delTradeInfoRes.data,
      delCommentRes: delCommentRes.data,
      delImgs: delImgs.delete_list
    }
  }
})


module.exports = router