const { createPassword, validateHash } = require('../../services/crypto')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const userRepo = require('../../data/repos/user-repo')

module.exports = () => {
    return {
        userData: async (req, res) => {
            const { guid } = res.locals
            const {
                emailConfirmed,
                twoFactorEnabled,
                email,
                firstName,
                lastName
            } = await userRepo.getUser(guid)

            res.status(200).json({ emailConfirmed, twoFactorEnabled, email, firstName, lastName, guid })
        },
        changePassword: async (req, res) => {
            const { guid } = res.locals
            const { currentPassword, newPassword, confirmNewPassword } = req.body

            if (!newPassword || newPassword !== confirmNewPassword) {
                return res.status(400).json(['New passwords do not match!'])
            }

            const user = await userRepo.getUser(guid)

            // Validate user current password
            const isValid = await validateHash(currentPassword, user.passwordSalt, user.passwordHash)
            if (!isValid) {
                return res.status(400).json(['Unable to validate account! - Current password is incorrect!'])
            }

            // Update password
            const passwordData = await createPassword(newPassword)
            const affectedRows = await userRepo.updateAppUserPassword({ guid, passwordHash: passwordData.passwordHash, passwordSalt: passwordData.salt })

            if (affectedRows > 0) {
                // Maybe sent an email??

                res.status(200).json({
                    passwordUpdated: true
                })
            } else {
                res.status(400).json(['Unable to reset password!'])
            }
        },
        enableTwoFactor: (req, res) => {
            // To test base64 - https://codebeautify.org/base64-to-image-converter
            const { email } = res.locals
            const secret = speakeasy.generateSecret({ length: 20 })
            const url = speakeasy.otpauthURL({
                secret: secret.base32,
                label: email,
                issuer: 'Express API',
                encoding: 'base32'
            })
            QRCode.toDataURL(url, (err, dataURL) => {
                return res.json({
                    tempSecret: secret.base32,
                    dataURL
                })
            })
        },
        disableTwoFactor: async (req, res) => {
            const { guid } = res.locals
            const rowsAffected = await userRepo.updateAppUserTwoFactorEnabled(guid, false, null)

            if (rowsAffected > 0) {
                return res.status(200).json({ enabled: false, userInfo: ['Delete authenticator entry'] })
            } else {
                return res.status(400).json(['Unable to de-active Two Factor!'])
            }
        },
        verifyTwoFactor: async (req, res) => {
            const { guid } = res.locals
            const { token, secret } = req.body

            let isVerified = speakeasy.totp.verify({
                secret,
                encoding: 'base32',
                token
            })

            if (isVerified) {
                const rowsAffected = await userRepo.updateAppUserTwoFactorEnabled(guid, true, secret)

                if (rowsAffected > 0) {
                    return res.status(200).json({ enabled: true })
                } else {
                    return res.status(400).json(['Unable to activate Two Factor!'])
                }
            }

            return res.status(400).json(['Invalid Auth Code, verification failed.'])
        }
    }
}