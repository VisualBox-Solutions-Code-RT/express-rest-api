const hashPassword = require('./hash-sha512-password')

/** Validate user credentials */
module.exports = (userPassword, storedSalt, storedHash) => {
    return new Promise((resolve, reject) => {
        try {
            (async function () {
                var passwordData = await hashPassword(userPassword, storedSalt)
                resolve(storedHash === passwordData.passwordHash)
            })()
        } catch (error) {
            reject(error)
        }
    })
}