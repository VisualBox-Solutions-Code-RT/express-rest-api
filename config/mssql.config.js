module.exports = {
    database: process.env.SQL_DATABASE,
    options: {
        // Use this if you're on Windows Azure
        encrypt: process.env.SQL_ENCRYPT === 'false' ? false : true,
        enableArithAbort: true
    },
    password: process.env.SQL_PASS,
    user: process.env.SQL_USER,
    server: process.env.SQL_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 10000
    }
}
