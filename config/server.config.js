const
    bodyParser = require('body-parser'),
    compression = require('compression'),
    helmet = require('helmet'),
    morgan = require('morgan'),
    fileUpload = require('express-fileupload'),
    errorHandling = require('../middleware/error-handling-middleware'),
    authorize = require('../middleware/authorize-middleware'),
    cors = require('../middleware/cors-middleware')

/**
 * Creates server pipeline
 * @param {*} app 
 * @param {*} express 
 */
module.exports = (app, express) => {
    // Middleware
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
    }))

    app.use(cors)

    app.use(helmet())
    app.use(express.static('public'))
    app.use(morgan('dev', {
        skip: function (req, res) {
            if (process.env.NODE_ENV === 'production') {
                return res.statusCode <= 400
            }
        }
    }))

    app.use(compression())

    // App Routes
    app.use('/api/auth', require('../controllers/auth/auth-routes')())
    app.use('/api/account', authorize(), require('../controllers/account/account-routes')())
    app.use('/api/user', authorize(), require('../controllers/admin-user/user-routes')())
    app.use('/api/role', authorize(), require('../controllers/admin-role/role-routes')())

    // Error Handling
    app.use(errorHandling)
}