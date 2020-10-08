const generateSalt = require('./generate-salt')
const hashPassword = require('./hash-sha512-password')

const createPassword = (userpassword) => {
    return new Promise((resolve, reject) => {
        try {
            (async function () {
                var salt = await generateSalt(16) /** Gives us salt of length 16 */
                var passwordData = await hashPassword(userpassword, salt)
                resolve(passwordData)
            })()
        } catch (error) {
            reject(error)
        }
    })

}

module.exports = createPassword