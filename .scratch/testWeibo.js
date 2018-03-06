const http = require('http')
const url = require('url')
const request = require('superagent')
const fs = require('fs')
const utils = require('ethereumjs-util')
const web3 = new require('web3')
const cheerio = require('cheerio')


const [tmp, app, screenName, id, address] = '/w/1772527750/G5D94rZlE'.split('/')

function respond(err, val) {
  console.log(val || '0', err || '')
}


request
.get(`https://weibo.com/${screenName}/${id}`)
.then(function (tweet) {
  if (tweet.text) {
    console.log(tweet.text)
    return;

    const $ = cheerio.load(tweet.text)
    const content = $('meta[name="description"]').attr('content').replace(/[^x0-9a-f]+/g, '')
    const userId = screenName
    console.log(content)
    console.log(userId)

  }
})
.catch(function (err) {
  console.log('ERROR ' + err)
})
