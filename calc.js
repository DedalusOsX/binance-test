const api = require('binance');
const fs = require('fs');
const _ = require('lodash');
const Slack = require('./slackNotify');

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

const SYMBOL = process.env.SYMBOL || 'HOTUSDT';
const ENTRY_PRICE = process.env.PRICE || 0.002140;


class Base {
    constructor() {
        this.yT = 3600;
        this.zT = 600;
        this.x = ENTRY_PRICE;
        this.y = 0;
        this.z = 0;
        this.notified = false;
        this.path = `./data/${SYMBOL}.json`;
        this.getData = this.getData.bind(this);
    }

    init() {
        this.readFile();
        Slack.sendInfo(`${SYMBOL} service start!`, 'alogcheck');
    }

    readFile() {
        const f = fs.readFileSync(this.path, 'utf8');
        return JSON.parse(f);
    }

    calcY(price) {
        this.y = ((this.yT * this.y) + price) / (this.yT + 1)
    }

    calcZ(price) {
        this.z = ((this.zT * this.z) + price) / (this.zT + 1)
    }

    calcX() {
        if (this.y >= (this.x + ENTRY_PRICE)) {
            this.x = this.y / ENTRY_PRICE
        }
        else if (this.z <= (this.x - ENTRY_PRICE)) {
            this.x = this.z / ENTRY_PRICE;
        }
    }

    async getData() {
        const r = await binanceRest.tickerPrice({symbol: SYMBOL});
        console.log('r', r);
        const d = {d: Date.now(), p: parseFloat(r.price)};
        if (!this.y) this.y = d.p;
        if (!this.z) this.z = d.p;
        if (!fs.existsSync(this.path)) {
            fs.writeFileSync(this.path, JSON.stringify([d]));
        }
        else {
            const json = this.readFile();
            json.push(d);
            fs.writeFileSync(this.path, JSON.stringify(json))
        }
        this.calcY(d.p);
        this.calcZ(d.p);
        this.calcX();
        this.checkPrices(d.p);
    }

    checkPrices(price) {
        Slack.sendInfo(`x:${this.x.toFixed(5)}, y:${this.y.toFixed(5)}, z:${this.z.toFixed(5)}, p:${price.toFixed(5)}`, 'algocheck');

        if ((this.x * 0.96) < this.z <= (this.x * 0.98)) {
            Slack.sendInfo(`${SYMBOL} Price drop 10% price:${this.x}`)
        }
        else if ((this.x * 0.94) < this.z <= (this.x * 0.96)) {
            Slack.sendWarning(`${SYMBOL} Price drop 20% price:${this.x}`)
        }
        else if (this.z <= (this.x * 0.94)) {
            Slack.sendAlert(`${SYMBOL} Price drop 30% price:${this.x}`)
        }
    }
}


module.exports = Base;