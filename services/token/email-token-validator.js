const jwt = require('jsonwebtoken')

module.exports = token => jwt.verify(token, process.env.JWT_EMAIL_KEY)