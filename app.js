const express = require('express'),
    chalk = require('chalk'),
    app = express(),
    configureServer = require('./config/server.config')

configureServer(app, express)

const server = app.listen(process.env.PORT, function () {
    console.log(chalk.blueBright(`[NODE_ENV=${process.env.NODE_ENV}] Application running on port: ${process.env.PORT}`))
})

process.on('disconnect', () => {
    console.log(chalk.red('Application disconnected'))
})

process.on('exit', (code) => {
    console.log(chalk.red(`Application exited with code (${code}) || 0 = clean exit  1 = crash exit`))
})

// Shut down server
function shutdown() {
    server.close(function onServerClosed(err) {
        if (err) {
            console.error(err)
            process.exitCode = 1
        }
        process.exit()
    })
}

// Signal to Docker
process.on('SIGINT', function onSigint() {
    console.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString())
    shutdown()
})

process.on('SIGTERM', function onSigterm() {
    console.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString())
    shutdown()
})
