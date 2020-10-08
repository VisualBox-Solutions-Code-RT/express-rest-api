const crypto = require('crypto')

/**
 * Hash string with sha512.
 * @function
 */
const hashSHA512 = function (hashableValue, hashKey) {
    return new Promise((resolve, reject) => {
        try {
            var hash = crypto.createHmac('sha512', hashKey) /** Hashing algorithm sha512 */
            hash.update(hashableValue)
            var hashedValue = hash.digest('hex')
            resolve(hashedValue)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = hashSHA512