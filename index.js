'use strict'

const request = require('superagent')
const utils = require('ethereumjs-util')
const cheerio = require('cheerio')
const serverless = require('serverless-http')

const express = require('express')
const app = express()

const db = require('./db')

app.get('/', (req, res) => {
  res.send('Welcome to the Tweedentity API')
})

app.get('/tweeter/:userId', (req, res) => {

  db.get(req.params.userId, (error, result) => {
    if (error) {
      console.log('Error:', error)
      res.status(400).json(error)
    } else {
      res.jsonp(result)
    }
  })
})

app.get('/tweet/:tweetId/:address', (req, res) => {

  function respond(err, val) {
    if (err) console.log('Error', err)
    res.send(val)
  }

  const {tweetId, address} = req.params

  if (tweetId && /^\d{18,20}$/.test(tweetId) && tweetId.length < 20 && /0x[0-9a-fA-F]{40}/.test(address)) {

    request
    .get(`https://twitter.com/twitter/status/${tweetId}`)
    .then(tweet => {
      if (tweet.text) {
        const $ = cheerio.load(tweet.text)
        const content = $('meta[property="og:description"]').attr('content').replace(/[^x0-9a-f]+/g, '')
        const dataTweet = $('div[data-tweet-id="' + tweetId + '"]')
        const userId = dataTweet.attr('data-user-id')
        const screenName = dataTweet.attr('data-screen-name')
        const name = dataTweet.attr('data-name')

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
            db.put(userId, screenName, name, (err) => {
              if (err) {
                console.log('Error', err)
              }
              respond(null, userId)
            })
          } else respond('wrong-sig') // wrong signature
        } else respond('wrong-tweet') // wrong tweet

      }
    })
    .catch(() => {
      respond('catch-error')
    })
  } else {
    respond('wrong-pars')
  }

})

app.use((req, res) => {
  res.status(404).send('Not found')
})

module.exports.handler = serverless(app)