const asyncWrapper = require('../../helpers/async-wrapper-helper')
const router = require('express').Router()
const authController = require('./auth-controller')()

function routes() {
    router
        .post('/register', asyncWrapper(authController.register))
        .post('/token', asyncWrapper(authController.token))
        .post('/tfa/token', asyncWrapper(authController.tfaToken))
        .post('/confirm-email', asyncWrapper(authController.confirmEmail))
        .post('/forgot-password', asyncWrapper(authController.forgotPassword))
        .post('/reset-password', asyncWrapper(authController.resetPassword))
        .post('/send-email-confirmation', asyncWrapper(authController.sendEmailConfirmation))
        .get('/create-admin', asyncWrapper(authController.createAdmin))

    return router
}

module.exports = routes