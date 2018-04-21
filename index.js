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
        const content = $('meta[property="og:description"]').attr('content').replace(/^(|.+)tweedentity\(/, '').replace(/\)(|.+)$/,'').split(',')

        const dataTweet = $('div[data-tweet-id="' + tweetId + '"]')
        const userId = dataTweet.attr('data-user-id')
        const screenName = dataTweet.attr('data-screen-name')
        const name = dataTweet.attr('data-name')

        const message = `twitter/${userId}@tweedentity`
        const address0 = content[0].toLowerCase()
        const message0 = `${content[1]}@tweedentity`
        const sig = content[2]
        const sigVer = content[3]
        const signer = content[4].split(':')[0]
        const version = content[4].split(':')[1]

        if (version === '1' && address0 === address && /^\w+$/.test(userId) && message0 === message && /^0x[0-9a-f]{130}/.test(sig)) {

          const msgHash = utils.hashPersonalMessage(utils.toBuffer(message))
          const sgn = utils.stripHexPrefix(sig)
          const r = new Buffer(sgn.slice(0, 64), 'hex')
          const s = new Buffer(sgn.slice(64, 128), 'hex')
          let v = parseInt(sgn.slice(128, 130), 16)
          if (v < 27) {
            v += 27
          }
          const pub = utils.ecrecover(msgHash, v, r, s)
          const addr = utils.setLength(utils.fromSigned(utils.pubToAddress(pub)), 20)
          if (utils.bufferToHex(addr).toLowerCase() === address.toLowerCase()) {
            db.put(userId, screenName, name, address, (err) => {
              if (err) {
                console.log('Error', err)
              }
              respond(null, userId)
            })
          } else respond('wrong-sig') // wrong signature
        } else respond('wrong-tweet') // wrong tweet

      }
    })
    .catch((err) => {
      console.log(err)
      respond('catch-error')
    })
  } else {
    respond('wrong-pars')
  }

})

app.use((req, res) => res.sendStatus(404))

exports.app = app
exports.handler = serverless(app)
