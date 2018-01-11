const http = require('http')
const url = require('url')
const request = require('superagent')

const hostname = '127.0.0.1'
const port = 3132

function resError(res, err) {
  res.statusCode = 500
  res.setHeader('Content-Type', 'text/plain')
  res.end(err)
}

const server = http.createServer((req, res) => {

  const pathname = url.parse(req.url).pathname.split('/')
  const screenName = pathname[1]
  const id = pathname[2]

  if (id && /^[a-z0-9_]+$/.test(screenName) && screenName.length <= 15 && /^\d+$/.test(id) && id.length < 20) {
    request
    .get(`https://twitter.com/${screenName}/status/${id}`)
    .then(function(res2) {
      if (res2.text) {
        let content = res2.text.match(/"og:description" content="[^"]+"/)[0].split('"')[3].replace(/^.{1}|.{1}$/g,'')

        if (content.length == 132) {

          res.statusCode = 200
          res.setHeader('Content-Type', 'text/plain')
          res.end(content)
        } else resError(res, 'Wrong tweet.')

      }
    })
    .catch(function(err) {
      console.error(err)
      resError(res, 'Http error.')
    })

  } else resError(res, 'Error.')
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})