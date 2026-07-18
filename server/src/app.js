const express = require('express');


const app = express();


app.get('/health', (req, res) => {
    res.status(200).json({
        status: true,
        message: "Server is healthy"
    })
})


module.exports = app;