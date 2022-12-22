const getAccessToken = require('../service/getAccessToken')
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const rq = require('request-promise')

const cloudStorage = {
  async download(ctx, fileList) {
    const ACCESS_TOKEN = await getAccessToken()
    const options = {
      method: 'post',
      url: `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`,
      data: {
        env: ctx.state.env,
        file_list: fileList
      }
    }
    const res = await axios(options)
    return res.data
  },
  async upload(ctx) {
    // 1、请求地址
    const file = ctx.request.files.file

    const path = `swiper/${Date.now()}-${Math.random()}-${file.originalFilename}`
    const ACCESS_TOKEN = await getAccessToken()
    const options = {
      method: 'post',
      url: `https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`,
      data: {
        path,
        env: ctx.state.env
      }
    }
    const { data: info } = await axios(options)

    // 2、上传图片
    // axios formdata 传输错误 ？？为什么 ？？ 会不会是没有 qs.string
    // const formData = new FormData()
    // formData.append('key', path)
    // formData.append('Signature', info.authorization)
    // formData.append('x-cos-security-token', info.token)
    // formData.append('x-cos-meta-fileid', info.cos_file_id)
    // formData.append('file', fs.createReadStream(file.filepath))
    // const params = {
    //   method: 'post',
    //   url: info.url,
    //   data: formData,
    //   transformRequest: [function(data, headers) {
    //     delete headers.post['Content-Type']
    //     return data
    //   }]
    // }
    // await axios(params)
    // return info.file_id
    const params = {
      method: 'post',
      uri: info.url,
      formData: {
        key: path,
        Signature: info.authorization,
        'x-cos-security-token': info.token,
        'x-cos-meta-fileid': info.cos_file_id,
        file: fs.createReadStream(file.filepath)
      },
      json: true
    }
    await rq(params)
    return info.file_id
  },
  async delete(ctx, fileid_list) {
    const ACCESS_TOKEN = await getAccessToken()
    const options = {
      method: 'post',
      url: `https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ACCESS_TOKEN}`,
      data: {
        env: ctx.state.env,
        fileid_list
      }
    }
    const res = await axios(options)
    return res.data
  }
}


module.exports = cloudStorage