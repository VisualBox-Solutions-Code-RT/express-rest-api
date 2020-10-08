const uuid = require('uuid')

module.exports = (email, passwordData) => {
    const user = {
        guid: uuid.v4(),
        email,
        passwordHash: passwordData.passwordHash,
        passwordSalt: passwordData.salt,
        emailConfirmed: false
    }

    return user
}