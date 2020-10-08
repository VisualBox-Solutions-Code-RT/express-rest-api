const fs = require('fs')

/**
 * Uses express-fileupload - pass in ```req.files.<name of upload>``` as 'files'
 * 
 * @param {type} object     files - can be an object or array.
 * @param {type} string     saveToPath - (defaults to cwd) the folder to save the file(s) to.
 * @param {type} string     fileName - will use uploaded filenames by default.
 * 
 * ```
 * if (req.files) {
    const files = req.files.photos
    await fileUploadHelper(files, 'uploads')
   }
 * ```
 */
module.exports = async (files, saveToPath, fileName = '') => {
    // Synchronous process to ensure folder has been created
    if (!fs.existsSync(saveToPath)) {
        fs.mkdirSync(saveToPath)
    }

    if (Array.isArray(files)) {
        files.forEach(async file => {
            if (fileName === '') {
                await file.mv(`${saveToPath}/${file.name}`)
            } else {
                await file.mv(`${saveToPath}/${fileName}`)
            }
        })
    } else {
        await files.mv(`${saveToPath}/${files.name}`)
    }
}