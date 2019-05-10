const express = require('express')
const server = express()

const port = 8000

server.get('/market/tickers', (req, res, next) => {
    res.json({
        code: 0,
        data: {},
        message: ''
    })
})

server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
})