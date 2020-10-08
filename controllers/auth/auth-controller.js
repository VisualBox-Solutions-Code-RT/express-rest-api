const speakeasy = require('speakeasy')
const userRepo = require('../../data/repos/user-repo')
const roleRepo = require('../../data/repos/role-repo')
const { registerEmail, forgotPasswordEmail } = require('../../services/nodemailer')
const { emailTokenGenerator, emailTokenValidator, authTokenGenerator, createUser } = require('../../services/token')
const { createPassword, validateHash, hashSHA512String } = require('../../services/crypto')
const validator = require('../../helpers/validation-helper')


module.exports = () => {
    return {
        register: async (req, res) => {
            const { email, password = '', confirmPassword = '' } = req.body

            if (!validator.validateEmailAddress(email)) {
                return res.status(400).json(['Provided email is invalid.'])
            }

            if (!password || password !== confirmPassword) {
                return res.status(400).json(['Passwords do NOT match.'])
            }

            const user = await userRepo.getUserByEmail(email)
            if (user) {
                return res.status(400).json(['Email address already in use.'])
            }

            const passwordData = await createPassword(password)
            const newUser = createUser(email, passwordData)
            const { userId } = await userRepo.insertAppUser(newUser)

            if (userId !== null) {
                const emailConfirmationToken = await emailTokenGenerator(email, newUser.guid)

                // TODO: send email verification or add to a queue for background process to pick up every minute
                await registerEmail(newUser.email, emailConfirmationToken)

                res.status(201).json({
                    // TODO: remove in production - email should contain a link with the token and uid
                    guid: newUser.guid,
                    token: emailConfirmationToken
                })
            } else {
                res.status(400).json(['Unable to create account during registration process.'])
            }
        },
        token: async (req, res) => {
            const { email, password } = req.body
            const user = await userRepo.getUserByEmail(email)

            if (!user) {
                return res.status(400).json(['Unable to validate account!', 'Please check your credentials and try again.'])
            }

            // Step 1 - check user credentials
            const isValid = await validateHash(password, user.passwordSalt, user.passwordHash)
            if (!isValid) {
                return res.status(400).json(['Unable to validate account!'])
            }

            // Step 2 - verify whether account is locked (access denied until unlocked)
            if (user.accountLocked) {
                return res.status(400).json(['This account has been locked!'])
            }

            // Step 3 - verify email is confirmed (access denied until confirmed)
            if (!user.emailConfirmed) {
                return res.status(200).json({
                    emailConfirmed: user.emailConfirmed
                })
            }

            // Step 4 - if two-factor auth is enabled redirect to tfa login
            if (user.twoFactorEnabled) {
                return res.status(200).json({
                    emailConfirmed: user.emailConfirmed,
                    twoFactorEnabled: user.twoFactorEnabled
                })
            }

            // Step 5 - create JWT - add token payload - user data, roles, etc...
            const roles = await userRepo.getAppUserRoles(user.guid)
            const token = authTokenGenerator(user.id, user.guid, email, roles.map(role => role.name))

            // Log login date
            await userRepo.insertLoginDate(user.id)

            res.status(200).json({
                token,
                emailConfirmed: user.emailConfirmed,
                twoFactorEnabled: user.twoFactorEnabled
            })
        },
        tfaToken: async (req, res) => {
            const { token, email } = req.body
            const user = await userRepo.getUserByEmail(email)

            let isVerified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token
            })

            if (isVerified) {
                // Step 5 - create JWT - add token payload - user data, roles, etc...
                const roles = await userRepo.getAppUserRoles(user.id)
                const token = authTokenGenerator(user.id, user.guid, email, roles.map(role => role.name))

                // Log login date
                await userRepo.insertLoginDate(user.id)

                return res.status(200).json({ token })
            }

            return res.status(403).json(['Invalid Auth Code, verification failed. Please verify the system Date and Time'])
        },
        confirmEmail: async (req, res) => {
            const { token } = req.body

            try {
                const { kid, email } = emailTokenValidator(token)

                // Get user
                const user = await userRepo.getUserByEmail(email)

                // Validate user exists
                if (!user) {
                    return res.status(400).json(['Unable to validate account!'])
                }

                // Check if user has already got a confirmed email address
                if (user.emailConfirmed) {
                    return res.status(200).json({ emailConfirmed: user.emailConfirmed })
                }

                // Create hash and match token hash
                const hash = await hashSHA512String(user.guid, email)
                if (hash !== kid) {
                    return res.status(400).json(['Unable to validate token content!'])
                }

                const rowsAffected = await userRepo.updateAppUserEmailConfirmation(user.guid)
                const emailConfirmed = rowsAffected > 0

                res.status(200).json({ emailConfirmed })

            } catch (error) {
                return res.status(400).json([error.message])
            }
        },
        forgotPassword: async (req, res) => {
            const { email } = req.body
            const user = await userRepo.getUserByEmail(email)

            if (!user) {
                return res.status(400).json(['Unable to validate account!', 'Please check your credentials and try again.'])
            }

            // Might not want to inform user of this
            if (!user.emailConfirmed) {
                return res.status(400).json(['Please verify your email address.'])
            }

            // 68d15b2d043c322690f00c7fcaec72ff/

            // TODO: send email token or add to a queue for background process to pick up every minute
            const token = await emailTokenGenerator(email, user.guid)

            // TODO: Pass in token duration
            await forgotPasswordEmail(email, token, user.guid)

            // Send email containing password reset token
            res.status(200).json({
                // TODO: remove in production - email should contain a link with the token and uid
                token,
                guid: user.guid
            })
        },
        resetPassword: async (req, res) => {
            const { token, password, confirmPassword } = req.body

            // Validate password
            if (!password || password !== confirmPassword) {
                return res.status(400).json(['Passwords do not match!'])
            }

            // Verify token
            try {
                const { kid, email } = emailTokenValidator(token)

                // Get user
                const user = await userRepo.getUserByEmail(email)

                // Validate user exists
                if (!user) {
                    return res.status(400).json(['Unable to validate account!'])
                }

                // Create hash and match token hash
                const hash = await hashSHA512String(user.guid, email)
                if (hash !== kid) {
                    return res.status(400).json(['Unable to validate token content!'])
                }

                const passwordData = await createPassword(password)
                const affectedRows = await userRepo.updateAppUserPassword({ guid: user.guid, passwordHash: passwordData.passwordHash, passwordSalt: passwordData.salt })

                if (affectedRows > 0) {
                    res.status(200).json({
                        accountPasswordUpdated: true
                    })
                } else {
                    res.status(400).json(['Unable to reset password!'])
                }
            } catch (error) {
                return res.status(400).json([error.message])
            }
        },
        sendEmailConfirmation: async (req, res) => {
            const { email } = req.body
            // Email should already verified/exist before it gets to this request - can remove this and following check
            const user = await userRepo.getUserByEmail(email)

            if (!user) {
                // Fake a successfully email request
                return res.status(200).json()
            }

            const token = await emailTokenGenerator(email, user.guid)

            await registerEmail(email, token, user.guid)

            res.status(200).json({
                // TODO: remove in production - email should contain a link with the token and uid
                guid: user.guid,
                token
            })
        },
        createAdmin: async (req, res) => {
            const user = {
                email: 'support@fullscaleit.com',
                password: 'Admin1.'
            }

            const existingUser = await userRepo.getUserByEmail(user.email)
            if (existingUser) {
                return res.status(400).json(['Email address already in use.'])
            }

            const passwordData = await createPassword(user.password)
            let newUser = createUser(user.email, passwordData)
            newUser.emailConfirmed = true
            const { userId } = await userRepo.insertAppUser(newUser)

            const superRole = 'Super'
            const roles = await roleRepo.getRoles()
            const index = roles.findIndex(role => role.name === superRole)

            // Add Super role to admin user
            if (index === -1) {
                const { roleId } = await roleRepo.insertUpdateAppRole({ name: superRole })
                await userRepo.insertDeleteAppUserRole({ roleId, userId })

                // Initialize application roles
                await roleRepo.insertUpdateAppRole({ name: 'User' })
                await roleRepo.insertUpdateAppRole({ name: 'Manager' })
                await roleRepo.insertUpdateAppRole({ name: 'Admin' })
                await roleRepo.insertUpdateAppRole({ name: 'Supplier' })

                return res.status(201).json({ accountCreated: true })
            }

            res.status(400).json({ accountCreated: false })
        }
    }
}