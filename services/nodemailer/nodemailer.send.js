const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid-transport')
const mailerhbs = require('nodemailer-express-handlebars')
const nodemailerConfig = require('../../config/nodemailer.config')
const chalk = require('chalk')

module.exports = function (mailOptions, templateName) {
    const folderPath = './services/nodemailer/' + templateName
    const transporter = nodemailer.createTransport(sgTransport(nodemailerConfig))

    const handlebarOptions = {
        viewEngine: {
            extName: '.hbs',
            partialsDir: `${folderPath}`,
            layoutsDir: `${folderPath}`,
            defaultLayout: templateName + '.hbs'
        },
        viewPath: `${folderPath}`,
        extName: '.hbs'
    }

    transporter.use('compile', mailerhbs(handlebarOptions))

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Email error:', error)
        } else {
            console.log('Email sent to :', chalk.green(info.message))
        }
    })
}