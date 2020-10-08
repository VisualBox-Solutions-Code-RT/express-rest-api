/** 
 * Nodemailer configuration 
 */
module.exports = {
    service: process.env.NM_PROVIDER,
    auth: {
        user: process.env.NM_USER,
        pass: process.env.NM_PASS
    }
}