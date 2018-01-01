/* globals Promise */

const express = require('express')
const router = express.Router()
const twitterClient = require('../lib/TwitterClient')
const ethereum = require('../lib/Ethereum')
const db = require('../lib/db')
const constants = require('../constants')

router.get('/verify-tweet/:id/:address', function (req, res, next) {

    const id = req.params.id
    const address = req.params.address
    let referer = req.header('Referer')
    let environment = req.app.get('env')

    // for tests only
    if (req.app.get('env') === 'test') {
        if (req.query.referer) {
            referer = req.query.referer
        }
        if (req.query.NODE_ENV) {
            environment = req.query.NODE_ENV
        }
    }

    if (environment === 'production' &&
        (!referer || !/(\/|\.)tweedentity\.(com|org)/i.test(referer))) {
        res.json({
            success: false,
            message: 'Request not authorized.'
        })
    } else if (!/^0x[A-F0-9]{40}$/i.test(address) || !/^\d+$/.test(id)) {
        res.json({
            success: false,
            message: 'Wrong parameters.'
        })
    } else {

        res.set('Access-Control-Allow-Origin', '*')

        twitterClient.getTweet(id)
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
                    return Promise.reject('Tweet without a valid signature.')
                }
            })
            .then(confirmationCode => {
                res.json({
                    success: confirmationCode ? true : false,
                    confirmationCode
                })
            })
            .catch(err => {
                return db.logError({
                    api: 'GET /verify-tweet/:id/:address',
                    params: {id, address},
                    error: err
                })
                    .then(() => {

                        res.json({
                            success: false,
                            message: typeof err === 'string' ? err : 'Something went wrong :o('
                        })
                    })
            })
    }
})


router.get('/verify-cc/:cc/:address', function (req, res, next) {

    res.set('Access-Control-Allow-Origin', '*')

    const cc = req.params.cc
    const address = req.params.address

    if (!/^0x[A-F0-9]{40}$/i.test(address) || !/^[A-Za-z0-9]{8}$/.test(cc)) {
        res.json({
            success: false
        })
    } else {

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
                return db.logError({
                    api: 'GET /verify-cc/:cc/:address',
                    params: {cc, address},
                    error: err
                })
                    .then(() => {

                        res.json({
                            success: false
                        })
                    })
            })
    }
})

router.get('/', function (req, res, next) {

    res.json({
        success: true,
        message: constants.WELCOME_MESSAGE
    })
})


module.exports = router
