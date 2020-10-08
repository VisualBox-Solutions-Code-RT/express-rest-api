const nodemailer = require('nodemailer')
const mailerhbs = require('nodemailer-express-handlebars')
const nodemailerConfig = require('../../config/nodemailer.config')

module.exports = function (mailOptions, templateName) {
    const folderPath = './services/nodemailer/' + templateName
    const transporter = nodemailer.createTransport(nodemailerConfig)

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
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
}