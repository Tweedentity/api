'use strict'

const request = require('superagent')
const utils = require('ethereumjs-util')
const cheerio = require('cheerio')

module.exports.tweet = (event, context, callback) => {

  function respond(err, val) {
    if (err) console.log(err)
    const response = {
      statusCode: 200,
      body: val || ''
    }
    callback(null, response)
  }

  const {tweetId, address} = event.pathParameters

  if (tweetId && /^\d{18,20}$/.test(tweetId) && tweetId.length < 20 && /0x[0-9a-fA-F]{40}/.test(address)) {

    request
    .get(`https://twitter.com/twitter/status/${tweetId}`)
    .then(function (tweet) {
      if (tweet.text) {
        const $ = cheerio.load(tweet.text)
        const content = $('meta[property="og:description"]').attr('content').replace(/[^x0-9a-f]+/g, '')
        const userId = $('div[data-tweet-id="' + tweetId + '"]').attr('data-user-id')
        if (/^0x[0-9a-f]{130}/.test(content) && /^\w+$/.test(userId)) {

          const msgHash = utils.hashPersonalMessage(utils.toBuffer(`twitter/${userId}@tweedentity`))
          const sgn = utils.stripHexPrefix(content)
          const r = new Buffer(sgn.slice(0, 64), 'hex')
          const s = new Buffer(sgn.slice(64, 128), 'hex')
          let v = parseInt(sgn.slice(128, 130), 16)
          if (v < 27) {
            v += 27
          }
          const pub = utils.ecrecover(msgHash, v, r, s)
          const addr = utils.setLength(utils.fromSigned(utils.pubToAddress(pub)), 20)

          if (utils.bufferToHex(addr).toLowerCase() === address.toLowerCase()) {
            respond(null, userId)
          } else respond('wrong-sig') // wrong signature
        } else respond('wrong-tweet') // wrong tweet

      }
    })
    .catch(function (err) {
      respond('catch-error')
    })
  } else {
    respond('wrong-pars')
  }

}

