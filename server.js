// CALL THE PACKAGES --------------------
var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = 8080;
var https = require("https");
const api = require('binance');
const binanceRest = new api.BinanceRest({
    key: 'dqezb7gPWuReVXRNJ3RR4zHAL06qXV6RcAky7nLse2R9lPqGZKgWBTT3PVkssS16', // Get this from your account on binance.com
    secret: 'X11SY3JqDbNM6tfDIQ2rglcDXLscU7E8fYggHIxyd9IiyEIAvVJzMD21y7D5XzfP', // Same for this
    timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
    recvWindow: 10000, // Optional, defaults to 5000, increase if you're getting timestamp errors
    disableBeautification: false,
    /*
     * Optional, default is false. Binance's API returns objects with lots of one letter keys.  By
     * default those keys will be replaced with more descriptive, longer ones.
     */
    handleDrift: false
    /* Optional, default is false.  If turned on, the library will attempt to handle any drift of
     * your clock on it's own.  If a request fails due to drift, it'll attempt a fix by requesting
     * binance's server time, calculating the difference with your own clock, and then reattempting
     * the request.
     */
});

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');
  next();
});

app.use(morgan('dev'));

setInterval(()=>{
  binanceRest.tickerPrice({
        symbol: 'BNBUSDT'
      })
      .then((data) => {
          console.log(data);
      })
      .catch((err) => {
          console.error(err);
      });
},1000)

app.listen(port);
console.log('Magic happens on port ' + port);
