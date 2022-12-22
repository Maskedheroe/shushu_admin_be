const getAccessToken = require('../service/getAccessToken')
const axios = require('axios')

const callCloudFn = async (ctx, fnName, params) => {
  const ACCESS_TOKEN = await getAccessToken()
  const options = {
    url: `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${ACCESS_TOKEN}&env=${ctx.state.env}&name=${fnName}`,
    data: {
      ...params
    },
    method: 'post',
  }
  const res = await axios(options)
  return res
}
module.exports = callCloudFn