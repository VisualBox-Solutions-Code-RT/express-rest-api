const crypto = require('crypto')

/**
 * Hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
const hashSHA512 = function (password, salt) {
    return new Promise((resolve, reject) => {
        try {
            var hash = crypto.createHmac('sha512', salt) /** Hashing algorithm sha512 */
            hash.update(password)
            var value = hash.digest('hex')
            resolve({
                salt: salt,
                passwordHash: value
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = hashSHA512