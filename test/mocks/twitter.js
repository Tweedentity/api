const fixtures = require('../fixtures')

class Twitter {

    get(spec, cb) {
        let res
        if (/^statuses\/show\/\w+/.test(spec)) {
            const tweetId = spec.split('/')[2]
            res = fixtures.tweets[tweetId]
        }
        cb(null, res)
    }

}

module.exports = Twitter
