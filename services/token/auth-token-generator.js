const uuid = require('uuid')
const jwt = require('jsonwebtoken')

module.exports = (userId, userGuid, email, roles) => {
    const tokenPayload = {
        iss: process.env.JWT_ISSUER,
        jti: uuid.v4(),
        guid: userGuid,
        email,
        roles,
        uid: userId
        // IP: request.ip,
        // Aud: '',
        // Sub: ''
    }

    return jwt.sign(tokenPayload, process.env.JWT_KEY, { expiresIn: process.env.JWT_LOGIN_DURATION, algorithm: 'HS256' })
}


