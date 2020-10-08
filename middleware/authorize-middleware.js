const { authTokenValidator } = require('../services/token')
const authorizationHelper = require('../helpers/authorization-helper')

/**
 * Pass array like this => ['Role1','Role2','Role3'] or nothing for default token authentication
 * @param {*} authorizedRolesArray An array of string
 */
const authorize = (authorizedRolesArray = []) => {
    return (req, res, next) => {
        // Check HTTP Header
        if (!req.headers.authorization) {
            return res.status(401).json(['Authorization Header not present!'])
        }

        // Split Bearer token
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(401).json(['Token incorrectly formed.'])
        }

        try {
            // Validate and extract data from token
            const { uid, guid, roles, email } = authTokenValidator(token)
            // Set values to res.locals to pass through middelware
            res.locals = { uid, guid, roles, email }

            // Check for role authorization
            if (authorizedRolesArray.length > 0) {
                if (authorizationHelper.hasAccess(authorizedRolesArray, roles)) {
                    next()
                } else {
                    return res.status(403).json(['Access denied!'])
                }
            } else {
                next()
            }
        } catch (error) {
            return res.status(401).json([error.message])
        }
    }
}

module.exports = authorize