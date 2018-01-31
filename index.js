const http = require('http')
const url = require('url')
const request = require('superagent')
const fs = require('fs')
const utils = require('ethereumjs-util')
const web3 = new require('web3')
const cheerio = require('cheerio')

const port = 9093

function log(...what) {
  if (what) {
    what = what.join(' ')
    console.log(what)
    fs.appendFileSync('access.log', new Date().toISOString() + ' ' + what + '\n')
  }
}

const server = http.createServer((req, res) => {

  let pathname = url.parse(req.url).pathname
  if (pathname === '/favicon.ico') {
    res.end()
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')

  const [tmp, screenName, id, address] = pathname.split('/')

  function respond(err, val) {
    log(val || '0', err || '')
    res.end(val || '')
  }

  if (id && /^[a-z0-9_]+$/i.test(screenName) && screenName.length <= 15 && /^\d{18,20}$/.test(id) && id.length < 20 && web3.utils.isAddress(address)) {

    log('GET ' + pathname)

    res.setHeader('Access-Control-Allow-Origin', '*')

    request
    .get(`https://twitter.com/${screenName}/status/${id}`)
    .then(function (tweet) {
      if (tweet.text) {
        const $ = cheerio.load(tweet.text)
        const content = $('meta[property="og:description"]').attr('content').replace(/[^x0-9a-f]+/g,'')
        const userId = $('div[data-tweet-id="'+id+'"]').attr('data-user-id')
        if (/^0x[0-9a-f]{130}/.test(content) && /^\w+$/.test(userId)) {

          const msgHash = utils.hashPersonalMessage(utils.toBuffer(`${screenName}@tweedentity`))
          const sgn = utils.stripHexPrefix(content)
          const r = new Buffer(sgn.slice(0, 64), 'hex')
          const s = new Buffer(sgn.slice(64, 128), 'hex')
          const v = parseInt(sgn.slice(128, 130), 16) // + 27
          const pub = utils.ecrecover(msgHash, v, r, s)
          const addr = utils.setLength(utils.fromSigned(utils.pubToAddress(pub)), 20)

          if (utils.bufferToHex(addr).toLowerCase() === address.toLowerCase()) {
            respond(null, userId)
          } else respond('wrong-sig') // wrong signature
        } else respond('wrong-tweet') // wrong tweet

      }
    })
    .catch(function (err) {
      log('ERROR ' + err)
      respond('catch-error')
    })

  } else respond('wrong-params')
})
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})
server.listen(port)
