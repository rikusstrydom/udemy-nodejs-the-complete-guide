const express = require('express');
const bodyParser = require('body-parser');

const feedRouter = require('./routes/feed');

const app = express();

app.use(bodyParser.json()); // application/json

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRouter);

app.listen(3000);