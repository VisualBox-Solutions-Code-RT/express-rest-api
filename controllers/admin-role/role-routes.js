const asyncWrapper = require('../../helpers/async-wrapper-helper')
const router = require('express').Router()
const roleController = require('./role-controller')

function routes() {
    router
        .get('/roles', asyncWrapper(roleController.getRoles))
        .post('/', asyncWrapper(roleController.postAppRole))
        .put('/:id', asyncWrapper(roleController.putAppRole))
        .delete('/:id', asyncWrapper(roleController.deleteAppRole))

    return router
}

module.exports = routes