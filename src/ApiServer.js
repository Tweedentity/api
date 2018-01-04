const http = require('http')

const app = require('./app')
const Logger = require('./lib/Logger')

const noop = new Function()

class ApiServer {

  constructor(port = 9292) {

    this.port = port
    app.set('port', this.port)

    app.on('error', error => {
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
  }

  start(done = noop) {

    this.server = app.listen(this.port, () => {
      Logger.info(`Test server listening on port ${ this.port }`)
      done()
    })
  }

  stop(done = noop) {
    if (this.server) {
      this.server.close(() => {
        done()
      })
    } else {
      done()
    }
  }
}

module.exports = ApiServer



