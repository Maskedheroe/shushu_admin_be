const getAccessToken = require('../service/getAccessToken')
const axios = require('axios')

const callCloudDb = async (ctx, fnName, query = {}) => {
  const ACCESS_TOKEN = await getAccessToken()
  const options = {
    url: `https://api.weixin.qq.com/tcb/${fnName}?access_token=${ACCESS_TOKEN}`,
    data: {
      query,
      env: ctx.state.env
    },
    method: 'post'
  }
  const res = await axios(options)
  
  return res
}
module.exports = callCloudDb