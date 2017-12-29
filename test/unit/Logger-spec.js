var assert = require('chai').assert
var sinon = require('sinon')

var log = require('../../src/lib/Logger')

function consoleCount(expectedCount) {
    var count = console.log.callCount
    return count === expectedCount
}

describe('Logger', function () {

    before(function () {
        log.setLevel('trace')
    })

    after(function () {
        log.resetLevel()
    })

    beforeEach(function () {
        sinon.spy(console, 'log')
    })

    afterEach(function () {
        console.log.restore()
    })

    describe('error', function () {
        it('calls console.log', function () {
            var input = 'test'
            log.error(input)
            assert.isTrue(consoleCount(1))
        })

        it('calls console.log twice when object provided', function () {
            var input = 'test'
            log.error(input, { foo: 'bar' })
            assert.isTrue(consoleCount(2))
        })
    })

    describe('warn', function () {
        it('calls console.log', function () {
            var input = 'test'
            log.warn(input)
            assert.isTrue(consoleCount(1))
        })

        it('calls console.log twice when object provided', function () {
            var input = 'test'
            log.warn(input, { foo: 'bar' })
            assert.isTrue(consoleCount(2))
        })
    })

    describe('info', function () {
        it('calls console.log', function () {
            var input = 'test'
            log.info(input)
            assert.isTrue(consoleCount(1))
        })

        it('calls console.log twice when object provided', function () {
            var input = 'test'
            log.info(input, { foo: 'bar' })
            assert.isTrue(consoleCount(2))
        })
    })

    describe('debug', function () {
        it('calls console.log', function () {
            var input = 'test'
            log.debug(input)
            assert.isTrue(consoleCount(1))
        })

        it('calls console.log twice when object provided', function () {
            var input = 'test'
            log.debug(input, { foo: 'bar' })
            assert.isTrue(consoleCount(2))
        })
    })

    describe('trace', function () {
        it('calls console.log', function () {
            var input = 'test'
            log.trace(input)
            assert.isTrue(consoleCount(1))
        })

        it('calls console.log twice when object provided', function () {
            var input = 'test'
            log.trace(input, { foo: 'bar' })
            assert.isTrue(consoleCount(2))
        })
    })
})
