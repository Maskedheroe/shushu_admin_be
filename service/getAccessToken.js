const axios = require('axios')
const fs = require('fs')
const path = require('path')
const fileName = path.resolve(__dirname, '../assets/access_token.json')


const REFRESH_TIME = 7200 - 300
const URL = 'https://api.weixin.qq.com/cgi-bin/token'
const AppID = 'wxb59cffd1988a6ba6'

// grant_type=client_credential&appid=APPID&secret=APPSECRET 
const updateAccessToken = async () => {
  const url = URL + `?grant_type=client_credential&appid=${AppID}&secret=d0fe51d1c341b7415cb39fea11dd0cef`
  const res = await axios({
    method: 'get',
    url
  })
  const token = res.data.access_token
  if (token) {
    fs.writeFileSync(fileName, JSON.stringify({
      access_token: token,
      createTime: new Date()
    }))
  } else {
    console.warn('请求错误，五秒后重新请求')
    setTimeout(async () => { await updateAccessToken() }, 5000)
  }
}

const getAccessToken = async () => {
  try {
    const readRes = fs.readFileSync(fileName, 'utf8')
    const readObj = JSON.parse(readRes)
    const createTime = new Date(readObj.createTime).getTime()
    const nowTime = new Date().getTime()
    const outDateTime = (nowTime - createTime) / 1000 / 60 / 60 >= 2
    if (outDateTime) { 
      await updateAccessToken()
      await getAccessToken()
    }
    return readObj.access_token
  } catch (error) {
    await updateAccessToken()
    await getAccessToken()
  }
}
setInterval(async () => {
  await updateAccessToken()
}, REFRESH_TIME * 1000)

module.exports = getAccessToken