const send = require('../nodemailer.send')

const templateName = 'register'

module.exports = function (to, token) {
    let mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        cc: [],
        bcc: [],
        subject: 'Express App Registration',
        template: templateName,
        context: {
            token,
            appUrl: process.env.APP_URL + process.env.APP_EMAIL_CONFIRMATION_PATH,
            expiryTime: process.env.JWT_EMAIL_CONFIRMATION_DURATION / 60000 // Display time in minutes
        }
    }

    send(mailOptions, templateName)
}