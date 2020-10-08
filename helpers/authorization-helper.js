module.exports = {
    hasAccess: (authorizedRolesArray, tokenRoles) => {
        let userRoles = []

        if (typeof tokenRoles === 'string') {
            userRoles.push(tokenRoles)
        } else if (typeof tokenRoles === 'object') {
            userRoles = tokenRoles
        }

        // Function choice some() = return true / every() return false
        const hasAccess = userRoles.some(userRole => {
            const index = authorizedRolesArray.indexOf(userRole)
            // If user has role 
            if (index !== -1) {
                return true
            }
        })

        return hasAccess
    }
}