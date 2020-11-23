/** 
 * Nodemailer configuration 
 */
module.exports = {
    auth: {
        // eslint-disable-next-line camelcase
        api_key: process.env.SENDGRID_API_KEY
    }
}