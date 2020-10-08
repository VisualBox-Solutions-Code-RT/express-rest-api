/**
 * Use with controller as error catching method
 * @param {*} fn 
 */
module.exports = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next)
}