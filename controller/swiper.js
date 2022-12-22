const Router = require('koa-router')
// const callCloudFn = require('../utils/callCloudFn')
const router = new Router()
const callCloudDb = require('../utils/callCloudDB')
const cloudStorage = require('../utils/callCloudStorage')

router.get('/list', async (ctx, next) => {
  // 默认获取十条数据
  const query = `db.collection('swiper').get()`
  const res = await callCloudDb(ctx, 'databasequery', query)

  if (res.data.errcode === 0) {
    const data = res.data.data
    const [fileList, databse_id] = setfileData(data)
    const resData = await setResData(ctx, fileList, databse_id)
    ctx.body = {
      code: 20000,
      data: resData
    }
  } else {
    ctx.body = {
      code: -1,
      data: '服务器请求错误'
    }
  }
})

function setfileData(data) {
  // 将云存储的数据转换为
  // {
  //   download_url
  //   fileid
  //   _id
  // }

  const fileList = [] // 文件下载链接
  const databse_id = [] //图片在数据库的_id
  for (const item of data) {
    const data = JSON.parse(item)
    fileList.push({
      fileid: data.fileid,
      max_age: 7200
    })
    databse_id.push(data._id)
  }
  return [fileList, databse_id]
}

// 组装 result 返回给前端
async function setResData(ctx, fileList, databse_id) {
  const dlRes = await cloudStorage.download(ctx, fileList)
  const downloadUrls = dlRes.file_list.map((item) => {
    return item.download_url
  })
  const resData = []

  for (let i = 0, len = dlRes.file_list.length; i < len; i++) {
    resData.push({
      download_url: downloadUrls[i],
      fileid: dlRes.file_list[i].fileid,
      _id: databse_id[i]
    })
  }
  return resData
}

router.post('/upload', async (ctx, next) => {
  const fileid = await cloudStorage.upload(ctx)

  const query = `
    db.collection('swiper').add({
      data: {
        fileid: '${fileid}'
      }
    })
  `
  const { data: { errcode, id_list } } = await callCloudDb(ctx, 'databaseadd', query)
  if (errcode === 0) {
    ctx.body = {
      code: 20000,
      id_list
    }
  }
})

router.get('/del', async (ctx, next) => {
  const params = ctx.request.query
  // 先删除云数据库 再删除文件
  const query = `db.collection('swiper').doc('${params._id}').remove()`
  const dbRes = await callCloudDb(ctx, 'databasedelete', query)
  const delRes = await cloudStorage.delete(ctx, [params.fileid])
  ctx.body = {
    code: 20000,
    data: {
      dbRes: dbRes.data,
      delRes: delRes.delete_list
    }
  }
})


module.exports = router

