/* globals Promise */

const bluebird = require('bluebird')
const redis = require('redis')
const crypto = require('crypto')
const Logger = require('./Logger')

if (process.env.NODE_ENV !== 'test') {
    bluebird.promisifyAll(redis.RedisClient.prototype)
    bluebird.promisifyAll(redis.Multi.prototype)
}

class Db {

    constructor() {
        try {
            this.client = redis.createClient(6379, process.env.REDIS_PORT_6379_TCP_ADDR)
        } catch (e) {
            Logger.warn('Redis connection failed.')
        }
    }

    now() {
        return Math.floor(new Date() / 1000)
    }

    randomString(length) {
        return crypto.randomBytes(2 * length).toString('base64').replace(/\/|\+/g, '0').substring(0, length)
    }

    getConfirmationCodeAndScreenName(address) {
        return this.client.hgetallAsync(`v:${address}`)
    }

    setConfirmationCode(address, screenName) {
        return this.getConfirmationCodeAndScreenName(address)
            .then(data => {
                if (data && data.cc && data.sn === screenName) {
                    return Promise.resolve(data.cc)
                } else {
                    const confirmationCode = this.randomString(8)
                    return this.client.hmsetAsync(`v:${address}`, {
                        sn: screenName,
                        cc: confirmationCode,
                        w: this.now()

                    }).then(() => Promise.resolve(confirmationCode))
                }
            })
    }

    getScreenName(address, confirmationCode) {
        return this.getConfirmationCodeAndScreenName(address)
            .then(data => {
                if (data && data.cc === confirmationCode) {
                    if (data.c) {
                        return Promise.resolve(data.sn)
                    } else {
                        return this.client.hsetAsync(`v:${address}`, {
                            c: this.now()
                        }).then(() => Promise.resolve(data.sn))
                    }
                } else {
                    return Promise.resolve()
                }
            })
    }

}

module.exports = new Db

