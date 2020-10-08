const asyncWrapper = require('../../helpers/async-wrapper-helper')
const router = require('express').Router()
const userController = require('./user-controller')
function routes() {
    // Route - /api/user
    router
        .get('/users', asyncWrapper(userController.getUsers))
        .get('/:guid', asyncWrapper(userController.getUser))
        .put('/:guid', asyncWrapper(userController.putUser))
        .post('/', asyncWrapper(userController.postUser))
        .delete('/:guid/:isDeleted', asyncWrapper(userController.deleteUser))
        .get('/:guid/roles', asyncWrapper(userController.getUserRoles))
        .post('/role/add', asyncWrapper(userController.postRoleToUser))
        .delete('/role/remove/:userId/:roleId', asyncWrapper(userController.deleteRoleFromUser))

    return router
}

module.exports = routes