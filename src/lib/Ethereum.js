const utils = require('ethereumjs-util')

class Ethereum {

    verifySignature(msg, address, signature) {

        const msgHash = utils.hashPersonalMessage(utils.toBuffer(msg))
        const sgn = utils.stripHexPrefix(signature)
        const r = new Buffer(sgn.slice(0, 64), 'hex')
        const s = new Buffer(sgn.slice(64, 128), 'hex')
        const v = parseInt(sgn.slice(128, 130), 16) + 27
        const pub = utils.ecrecover(msgHash, v, r, s)
        const addr = utils.setLength(utils.fromSigned(utils.pubToAddress(pub)), 20)
        return utils.bufferToHex(addr).toLowerCase() === address.toLowerCase()
    }

}

module.exports = new Ethereum