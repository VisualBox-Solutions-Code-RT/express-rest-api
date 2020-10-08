const sql = require('mssql')
const chalk = require('chalk')
const config = require('./mssql.config')
// https://tediousjs.github.io/node-mssql/#connection-pools

const pool = new sql.ConnectionPool(config)

pool.connect(err => {
    console.log(chalk.yellow(`Connecting to SQL Server => ${chalk.cyan(config.server)} => Database => ${chalk.cyan(config.database)}`))
    console.log(chalk.yellow(`MSSQL Connection Pool Active: ${pool.connected ? chalk.cyan('Yes') : chalk.red('No')}`))
    if (err) {
        console.log(chalk.red(`MSSQL Connection Pool Error: ${err}`))
    }
})



pool.on('error', err => {
    console.log(chalk.red(`MSSQL Error: ${err}`))
    pool.close()
})

module.exports = { sql, pool }