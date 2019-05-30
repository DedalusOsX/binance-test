// CALL THE PACKAGES --------------------
const express = require('express');
const app = express();
const morgan = require('morgan');
const Base = require('./calc');

const port = process.env.PORT || 8080;


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');
    next();
});

app.use(morgan('dev'));


//constants


const B = new Base();
B.init();
setInterval(B.getData, 1000);

app.listen(port);
console.log('Magic happens on port ' + port);
