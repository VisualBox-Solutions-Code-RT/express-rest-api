const winston = require('winston')

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
})

const loggers = {
    data: winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [new winston.transports.Console()],
    }),
    error: winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        transports: [
            new winston.transports.Console()
        ],
    })
}

const logError = loggers.error.error
const logData = loggers.data.info

module.exports = { logError, logData, logger }