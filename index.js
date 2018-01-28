const http = require('http')
const url = require('url')
const request = require('superagent')
const fs = require('fs')

const port = 9093

function resError(res, err) {
  res.statusCode = 500
  res.setHeader('Content-Type', 'text/plain')
  res.end(err)
}

function log(what) {
  console.log(what)
  fs.appendFileSync('access.log', new Date().toISOString() + ' ' + what + '\n')
}

const server = http.createServer((req, res) => {

  let pathname = url.parse(req.url).pathname
  if (pathname == '/favicon.ico') {
    res.end()
    return
  }

  log('GET ' + pathname)

  pathname = pathname.split('/')
  const screenName = pathname[1]
  const id = pathname[2]

  if (id && /^[a-z0-9_]+$/i.test(screenName) && screenName.length <= 15 && /^\d{18,20}$/.test(id) && id.length < 20) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    request
    .get(`https://twitter.com/${screenName}/status/${id}`)
    .then(function (res2) {
      if (res2.text) {
        let content = res2.text.match(/"og:description" content="[^"]+"/)[0].split('"')[3].replace(/^.{1}|.{1}$/g, '')

        if (/^0x[0-9a-f]{130}/.test(content)) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/plain')
          res.end(content)
        } else resError(res, 'Wrong tweet.')

      }
    })
    .catch(function (err) {
      log('ERROR ' + err)
      resError(res, 'Http error.')
    })

  } else resError(res, 'Error.')
})

server.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`)
})

// setInterval(function () {console.log(Date.now())}, 5e3)

//
//
// const server = http.createServer((req, res) => {
//   res.setHeader('Content-Type', 'text/plain');
//   res.end();
// });
// server.listen(9093);