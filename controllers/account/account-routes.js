const asyncWrapper = require('../../helpers/async-wrapper-helper')
const router = require('express').Router()
const accountController = require('./account-controller')()

function routes() {
    router
        .get('/data', asyncWrapper(accountController.userData))
        .post('/change-password', asyncWrapper(accountController.changePassword))
        .get('/tfa/enable', asyncWrapper(accountController.enableTwoFactor))
        .post('/tfa/disable', asyncWrapper(accountController.disableTwoFactor))
        .post('/tfa/verify', asyncWrapper(accountController.verifyTwoFactor))

    return router
}

module.exports = routes