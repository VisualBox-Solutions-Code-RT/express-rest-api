const { pool, sql } = require('../../../config/mssql.connect')
const camelcase = require('../../../helpers/camelcase-helper')

module.exports = {
    /** Returns user data by email address */
    getUserByEmail: async (email) => {
        let result = await pool.request()
            .input('email', email)
            .execute('[node].[spGetAppUserByEmail]')

        return camelcase(result.recordset[0])
    },
    getUser: async (guid) => {
        let result = await pool.request()
            .input('guid', guid)
            .execute('[node].[spGetAppUsers]')

        return camelcase(result.recordset[0])
    },
    getUsers: async () => {
        let result = await pool.request()
            .input('guid', null)
            .execute('[node].[spGetAppUsers]')

        return camelcase(result.recordset)
    },
    insertLoginDate: async (id) => {
        let result = await pool.request()
            .input('id', id)
            .execute('[node].[spInsertLoginDate]')

        return result.rowsAffected[0]
    },
    /** Return Id */
    insertAppUser: async ({ guid, email, passwordHash, passwordSalt, emailConfirmed, accountLocked = false, twoFactorEnabled = false }) => {
        let result = await pool.request()
            .input('guid', guid)
            .input('email', email)
            .input('passwordHash', passwordHash)
            .input('passwordSalt', passwordSalt)
            .input('emailConfirmed', sql.Bit, emailConfirmed)
            .input('accountLocked', sql.Bit, accountLocked)
            .input('twoFactorEnabled', sql.Bit, twoFactorEnabled)
            .execute('[node].[spInsertAppUser]')

        return camelcase(result.recordset[0])
    },
    updateAppUser: async ({ guid, email, firstName, lastName, emailConfirmed, accountLocked, twoFactorEnabled }) => {
        let result = await pool.request()
            .input('guid', guid)
            .input('email', email)
            .input('firstName', firstName)
            .input('lastName', lastName)
            .input('emailConfirmed', sql.Bit, emailConfirmed)
            .input('accountLocked', sql.Bit, accountLocked)
            .input('twoFactorEnabled', sql.Bit, twoFactorEnabled)
            .execute('[node].[spUpdateAppUser]')

        return result.rowsAffected[0]
    },
    updateAppUserEmailConfirmation: async (guid) => {
        let result = await pool.request()
            .input('guid', guid)
            .execute('[node].[spUpdateAppUserEmailConfirmation]')

        return result.rowsAffected[0]
    },
    updateAppUserTwoFactorEnabled: async (guid, enabled, secret) => {
        let result = await pool.request()
            .input('guid', guid)
            .input('enabled', sql.Bit, enabled)
            .input('twoFactorSecret', secret)
            .execute('[node].[spUpdateAppUserTwoFactorEnabled]')

        return result.rowsAffected[0]
    },
    updateAppUserPassword: async ({ guid, passwordHash, passwordSalt }) => {
        let result = await pool.request()
            .input('guid', guid)
            .input('passwordHash', passwordHash)
            .input('passwordSalt', passwordSalt)
            .execute('[node].[spUpdateAppUserPassword]')

        return result.rowsAffected[0]
    },
    getAppUserRoles: async (guid) => {
        let result = await pool.request()
            .input('guid', guid)
            .execute('[node].[spGetAppUserRoles]')

        return camelcase(result.recordset)
    },
    getRoles: async () => {
        let result = await pool.request()
            .execute('[node].[spGetAppRoles]')

        return camelcase(result.recordset)
    },
    /** Return Id */
    insertUpdateAppRole: async ({ id, name }) => {
        let result = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar(50), name)
            .execute('[node].[spInsertUpdateAppRole]')

        return camelcase(result.recordset[0])
    },
    /** Deletes the Application Role and the link to existing Users */
    deleteAppRole: async (id) => {
        let result = await pool.request()
            .input('id', sql.Int, id)
            .execute('[node].[spDeleteAppRole]')

        return result.rowsAffected[0]
    },
    /** Sets `IsDeleted` property to true */
    deleteAppUser: async (guid, isDeleted) => {
        let result = await pool.request()
            .input('guid', sql.NVarChar, guid)
            .input('isDeleted', sql.Bit, isDeleted)
            .execute('[node].[spDeleteAppUser]')

        return result.rowsAffected[0]
    },
    insertDeleteAppUserRole: async ({ userId, roleId }) => {
        let result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('roleId', sql.Int, roleId)
            .execute('[node].[spInsertDeleteAppUserRole]')

        return result.rowsAffected[0]
    }
}