const { logError } = require('../helpers/logger-helper')

module.exports = (error, req, res, next) => {

    const errorObject = {
        code: error.code,
        name: error.name,
        details: error.details,
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode
    }
    
    logError(errorObject)
    res.status(500).json(errorObject)

    next()
}