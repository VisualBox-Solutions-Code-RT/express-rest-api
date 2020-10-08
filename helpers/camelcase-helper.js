const camelcaseKeys = require('camelcase-keys')

/** Convert (SQL) data to lowerCamelCase */
module.exports = (recordset) => {
    try {
        if (recordset) { recordset = camelcaseKeys(recordset) }

        return recordset
    } catch (error) {
        throw 'Camelcase error'
    }
}