/* globals Promise */

const assert = require('assert')
const express = require('express')
const request = require('supertest')
const mockery = require('mockery')

const app = express()
const constants = require('../../src/constants')
const {address, tweetId, badTweetId, tweetIdWrongSig} = require('../fixtures')

describe('api', function () {

    let confirmationCode

    before(function () {
        mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        })
        mockery.registerMock('redis', require('../mocks/redis'))
        mockery.registerMock('twitter', require('../mocks/twitter'))
        app.use(require('../../src/routes/api'))
        return Promise.resolve()
    })

    after(function (done) {
        mockery.deregisterAll()
        mockery.disable()
        done()
    })

    describe('GET /', function () {

        it('should show the welcome message', function (done) {
            request(app)
                .get('/')
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === true)
                    assert(res.body.message === constants.WELCOME_MESSAGE)
                })
                .end(done)
        })
    })

    describe('GET /verify-tweet/:id/:address', function () {

        it('should return an error for wrong address', function (done) {
            request(app)
                .get(`/verify-tweet/${tweetId}/some-wrong-address`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === false)

                })
                .end(done)
        })

        it('should return an error for wrong tweetId', function (done) {
            request(app)
                .get(`/verify-tweet/some-wrong-id/${address}`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === false)

                })
                .end(done)
        })

        it('should return an error for missed referer in production', function (done) {

            request(app)
                .get(`/verify-tweet/${tweetId}/${address}?NODE_ENV=production`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === false)

                })
                .end(done)
        })

        it('should return an error for wrong referer in production', function (done) {

            request(app)
                .get(`/verify-tweet/${tweetId}/${address}?NODE_ENV=production&referer=example.com`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === false)

                })
                .end(done)
        })

        it('should not find the tweet', function (done) {
            request(app)
                .get(`/verify-tweet/99999999/${address}`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === false)
                    assert(res.body.message === 'Something went wrong :o(')
                })
                .end(done)
        })

        it('should verify that the tweet exists and contains a valid signature', function (done) {
            request(app)
                .get(`/verify-tweet/${tweetId}/${address}`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === true)
                    assert(res.body.confirmationCode.length === 8)
                    confirmationCode = res.body.confirmationCode
                })
                .end(done)
        })

        it('should fail because the signature is missed', function (done) {
            request(app)
                .get(`/verify-tweet/${badTweetId}/${address}`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === false)
                })
                .end(done)
        })

        it('should fail because the signature is wrong', function (done) {
            request(app)
                .get(`/verify-tweet/${tweetIdWrongSig}/${address}`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === false)
                })
                .end(done)
        })
    })

    describe('GET /verify-cc/:cc/:address', function () {

        it('should fails if wrong parameters', function (done) {
            request(app)
                .get(`/verify-cc/some-wrong-cc/${address}`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === false)
                })
                .end(done)
        })

        it('should fail if parameters are wrong', function (done) {
            request(app)
                .get(`/verify-cc/${confirmationCode}/some-wrong-address`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === false)
                })
                .end(done)
        })

        it('should verify that there is a screenName for a specific address and confirmation code', function (done) {
            request(app)
                .get(`/verify-cc/${confirmationCode}/${address}`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === true)
                    assert(res.body.screenName === 'twitterapi')
                })
                .end(done)
        })
    })

    describe('GET /verify-tweet/:id/:address', function () {

        it('should recover the confirmation code from a previously verified tweet', function (done) {
            request(app)
                .get(`/verify-tweet/${tweetId}/${address}`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === true)
                    assert(res.body.confirmationCode.length === 8)
                })
                .end(done)
        })
    })

    describe('GET /verify-cc/:cc/:address', function () {

        it('should recover the screenName for a specific address and confirmation code', function (done) {
            request(app)
                .get(`/verify-cc/${confirmationCode}/${address}`)
                .expect(200)
                .expect(function (res) {
                    assert(res.body)
                    assert(res.body.success === true)
                    assert(res.body.screenName === 'twitterapi')
                })
                .end(done)
        })
    })

})
