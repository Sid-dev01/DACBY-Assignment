const express = require('express');
const routes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/health', (req, res) => {
    res.status(200).json({
        status: true,
        message: "Server is healthy"
    })
})

app.use(`/api/${process.env.API_VERSION}`, routes);

app.use(errorHandler);

module.exports = app;