/* globals Promise */


class RedisClient {
}

class Multi {
}


class Client {

    constructor() {
        this.db = {}
    }

    hgetallAsync(key) {
        return new Promise((resolve, reject) => {
            resolve(this.db[key])
        })
    }

    hsetAsync(key, name, val) {
        return new Promise((resolve, reject) => {
            if (!this.db[key]) {
                this.db[key] = {}
            }
            this.db[key][name] = val
            resolve(true)
        })
    }

    hmsetAsync(key, obj) {
        return new Promise((resolve, reject) => {
            if (!this.db[key]) {
                this.db[key] = {}
            }
            for (let k in obj) {
                this.db[key][k] = obj[k]
            }
            resolve(true)
        })
    }

}

const redis = {

    RedisClient,
    Multi,

    createClient() {
        return new Client
    }

}

module.exports = redis