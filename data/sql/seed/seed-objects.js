require('dotenv').config()

const fs = require('fs')
const { pool } = require('../../../config/mssql.connect');

(async () => {
    try {
        await pool.connect()

        const dataSql = await fs.promises.readFile('./data/sql/seed/create-objects.sql', { encoding: 'utf-8' })
        let result = await pool.request().query(`${dataSql}`)
        console.log(result)
    } catch (error) {
        console.error('Seeding error', error)
    }
})()