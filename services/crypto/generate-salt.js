const crypto = require('crypto')

/**
 * Generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
const genRandomString = function (length) {
    return new Promise((resolve, reject) => {
        try {
            const salt = crypto.randomBytes(Math.ceil(length / 2))
                .toString('hex') /** Convert to hexadecimal format */
                .slice(0, length)   /** Return required number of characters */

            resolve(salt)
        } catch (error) {
            reject(error)
        }
    })
}


module.exports = genRandomString