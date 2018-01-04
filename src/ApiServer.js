const http = require('http')

const app = require('./app')
const log = require('./lib/log')

class ApiServer {

  constructor(port) {

    this.port = this.normalizePort(port)
    app.set('port', this.port)
    this.server = http.createServer(app)
  }

  normalizePort(val) {
    const port = parseInt(val, 10)
    if (isNaN(port)) {
      return val
    }
    if (port >= 0) {
      return port
    }
    return false
  }

  start(callback = new Function()) {

    this.server.listen(this.port, callback)

    this.server.on('error', error => {
      if (error.syscall !== 'listen') {
        throw error
      }
      const bind = typeof this.port === 'string'
      ? 'Pipe ' + this.port
      : 'Port ' + this.port

      // handle specific listen errors with friendly messages
      /* eslint-disable */
      switch (error.code) {
        case 'EACCES':

          console.error(bind + ' requires elevated privileges')
          process.exit(1)
          break
        case 'EADDRINUSE':
          console.error(bind + ' is already in use')
          process.exit(1)
          break
        default:
          throw error
      }
      /* eslint-enable */
    })

    this.server.on('listening', () => {
      const addr = this.server.address()
      const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port
      this.listening = true
      log.debug('Listening on ' + bind)

    })

  }

  stop() {
    this.server.close()
    this.listening = false
  }

}

module.exports = ApiServer



