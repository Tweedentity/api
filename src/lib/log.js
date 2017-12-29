const fs = require('./fs')
const Log = require('log')
const rfs = require('rotating-file-stream')

const logDirectory = '/var/log/0xNIL'

fs.ensureDirSync(logDirectory)

const accessLogStream = rfs('debug.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})

const log = new Log('debug', accessLogStream)

module.exports = log