const userRepo = require('../../data/repos/user-repo')
const validator = require('../../helpers/validation-helper')
const createPassword = require('../../services/crypto/create-password')
const createUser = require('../../services/token/create-user')

exports.getUser = async (req, res) => {
    const { guid } = req.params
    const user = await userRepo.getUser(guid)

    if (!user) {
        return res.status(400).json(['Unable to retrieve user data!'])
    }

    res.status(200).json(user)
}

exports.getUsers = async (req, res) => {
    const users = await userRepo.getUsers()

    const modifiedUserArray = users.map(user => {
        const { id, guid, email, emailConfirmed, accountLocked, twoFactorEnabled, firstName, lastName, isSupplier, supplierId } = user
        return { id, guid, email, emailConfirmed, accountLocked, twoFactorEnabled, firstName, lastName, isSupplier, supplierId }
    })

    res.status(200).json(modifiedUserArray)
}

exports.putUser = async (req, res) => {
    const { guid } = req.params
    const { email } = req.body
    const user = await userRepo.getUser(guid)

    // If the user email has changed - check if the new email address is valid + available
    if (user.email !== email) {

        if (!validator.validateEmailAddress(email)) {
            return res.status(400).json(['Provided email is invalid.'])
        }

        const otherUser = await userRepo.getUserByEmail(email)

        if (otherUser) {
            return res.status(400).json(['Email address already taken!'])
        }
    }

    const rowsAffected = await userRepo.updateAppUser({ ...req.params, ...req.body })

    if (rowsAffected > 0) {
        res.status(200).json({ updated: true })
    } else {
        res.status(400).json(['Unable to update user!'])
    }
}

exports.postUser = async (req, res) => {
    const { email, password, confirmPassword, emailConfirmed, roleId } = req.body

    if (!validator.validateEmailAddress(email)) {
        return res.status(400).json(['Provided email is invalid.'])
    }

    if (!password || password !== confirmPassword) {
        return res.status(400).json(['Passwords do NOT match.'])
    }

    const existingUser = await userRepo.getUserByEmail(email)
    if (existingUser) {
        return res.status(400).json(['Email address already in use.'])
    }

    const passwordData = await createPassword(password)
    let newUser = createUser(email, passwordData)
    newUser.emailConfirmed = emailConfirmed
    const { userId } = await userRepo.insertAppUser(newUser)

    const affectedRoles = await userRepo.insertDeleteAppUserRole({ roleId, userId })

    if (affectedRoles) {
        return res.status(201).json(newUser)
    } else {
        res.status(400).json(['User created but unable to assign role!'])
    }
}

exports.deleteUser = async (req, res) => {
    const { guid, isDeleted } = req.params
    const affectedRows = await userRepo.deleteAppUser(guid, isDeleted)

    if (affectedRows > 0) {
        res.status(200).json(affectedRows)
    } else {
        res.status(400).json(['Uable to delete user!'])
    }
}

exports.getUserRoles = async (req, res) => {
    const { guid } = req.params
    const userRoles = await userRepo.getAppUserRoles(guid)

    res.status(200).json(userRoles)
}

exports.postRoleToUser = async (req, res) => {
    const { userId, roleId } = req.body
    const rowsAffected = await userRepo.insertDeleteAppUserRole({ userId, roleId })

    if (rowsAffected > 0) {
        res.status(200).json({ added: true })
    } else {
        res.status(400).json(['Unable to add role!'])
    }
}

exports.deleteRoleFromUser = async (req, res) => {
    const { userId, roleId } = req.params
    const rowsAffected = await userRepo.insertDeleteAppUserRole({ userId, roleId })

    if (rowsAffected > 0) {
        res.status(200).json({ deleted: true })
    } else {
        res.status(400).json(['Unable to remove role!'])
    }
}
