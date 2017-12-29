/* globals Promise */
const Twitter = require('twitter')

class TwitterClient {

  constructor() {
    this.client = new Twitter({
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      access_token_key: process.env.ACCESS_TOKEN_KEY,
      access_token_secret: process.env.ACCESS_TOKEN_SECRET
    })
  }

  getTweet(tweetId) {
    return new Promise((resolve, reject) => {
      this.client.get(`statuses/show/${tweetId}`, (err, tweet, res) => {
        if (err) reject(err)
        else resolve(tweet)
      })
    })
  }

}

module.exports = new TwitterClient