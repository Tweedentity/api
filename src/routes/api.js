/* globals Promise */

const express = require('express')
const router = express.Router()
const twitterClient = require('../lib/TwitterClient')
const ethereum = require('../lib/Ethereum')
const db = require('../lib/db')
const constants = require('../constants')

router.get('/verify-tweet/:id/:address', function (req, res, next) {

    const tweedId = req.params.id
    const address = req.params.address

    twitterClient.getTweet(tweedId)
        .then(response => {
            let sig
            let screenName
            if (response) {
                sig = response.text.replace(/.*(0x[a-f0-9]{130}).*/, '$1')
                screenName = response.user.screen_name
            }
            if (sig && ethereum.verifySignature(screenName.toLowerCase(), address, sig)) {
                return db.setConfirmationCode(address, screenName, sig)
            } else {
                return Promise.reject()
            }
        })
        .then(confirmationCode => {
            res.json({
                success: confirmationCode ? true : false,
                confirmationCode
            })
        })
        .catch(err => {
            res.json({
                success: false
            })
        })
})


router.get('/verify-cc/:cc/:address', function (req, res, next) {

    const cc = req.params.cc
    const address = req.params.address

    db.getScreenName(address, cc)
        .then(screenName => {
            if (screenName) {
                res.json({
                    success: true,
                    screenName
                })
            } else {
                res.json({
                    success: false
                })
            }
        })
        .catch(err => {
            res.json({
                success: false
            })
        })
})

router.get('/', function (req, res, next) {

    res.json({
        success: true,
        message: constants.WELCOME_MESSAGE
    })
})


module.exports = router
