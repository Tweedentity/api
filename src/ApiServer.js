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

  start() {

    this.server.listen(this.port)

    this.server.on('error', error => {
      if (error.syscall !== 'listen') {
        throw error
      }
      const bind = typeof this.port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port

      // handle specific listen errors with friendly messages
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
    })

    this.server.on('listening', () => {
      const addr = this.server.address()
      const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port
      log.debug('Listening on ' + bind)

    })

  }

}

module.exports = ApiServer



