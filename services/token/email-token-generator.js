const uuid = require('uuid')
const jwt = require('jsonwebtoken')
const hashSHA512String = require('../../services/crypto/hash-sha512-string')

/**
 * Adds JTI claim and is signed with process.env.JWT_EMAIL_KEY
 * 
 * @param {*} token 
 */
module.exports = async (email, userGuid) => {
    const hash = await hashSHA512String(userGuid, email)
    const tokenPayload = { kid: hash, jti: uuid.v4(), email }
    return jwt.sign(tokenPayload, process.env.JWT_EMAIL_KEY, { expiresIn: process.env.JWT_EMAIL_CONFIRMATION_DURATION, algorithm: 'HS256' })
}


