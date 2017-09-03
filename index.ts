import * as rp from 'request-promise';
import * as moment from 'moment';
import * as colors from 'colors';
import notifier = require('node-notifier');
import Player = require('play-sound');

const player = Player({});
const priceLow = parseFloat(process.argv[2]);
const priceHigh = parseFloat(process.argv[3]);

const apiEndpoints: { [key: string]: () => Promise<Rates> } = {
    Coinbase: async () => {
        const usd = await rp({ uri: 'https://api.coinbase.com/v2/prices/spot?currency=USD', json: true });
        const aud = await rp({ uri: 'https://api.coinbase.com/v2/prices/spot?currency=AUD', json: true });
        
        return {
            usd: {
                raw: parseFloat(usd.data.amount),
                formatted: colors.green(`$${parseFloat(usd.data.amount).toFixed(2)}USD`)
            },
            aud: {
                raw: parseFloat(aud.data.amount),
                formatted: colors.blue(`$${parseFloat(aud.data.amount).toFixed(2)}AUD`)
            }
        };
    },
    Coinjar: async () => {
        const rates = await rp({ uri: 'https://api.coinjar.com/v3/exchange_rates', json: true });
        const usd = parseFloat(rates.exchange_rates.BTCUSD.midpoint);
        const aud = parseFloat(rates.exchange_rates.BTCAUD.midpoint);

        return {
            usd: {
                raw: usd,
                formatted: colors.red(`$${usd.toFixed(2)}USD`)
            },
            aud: {
                raw: aud,
                formatted: colors.magenta(`$${aud.toFixed(2)}AUD`)
            },
            notifier: () => {
                function notify(operator, target, price) {
                    notifier.notify({
                        title: `CoinJar Midpoint ${operator} $${target}`,
                        sound: true,
                        message: price
                    });
        
                    player.play('Morning_Flower.mp3', function(err) {
                        //console.log(`Could not play sound! Error: ${err}`);
                    });
                }

                if (aud <= priceLow) {
                    notify('<=', priceLow, aud);
                } else if (aud >= priceHigh) {
                    notify('=>', priceHigh, aud); 
                } 
            }
        };
    }
};

interface RateFormatObject {
    raw: number;
    formatted: string;
}

interface Rates {
    usd: RateFormatObject;
    aud: RateFormatObject;
    notifier?(): void;
}

async function notifyCurrentPrice() {
    let message = `[${moment().format('YYYY-MM-DD HH:mm:ss')}]`;
    for (const endpoint in apiEndpoints) {
        const rates = await apiEndpoints[endpoint]();
        message += `\n${endpoint}: ${rates.usd.formatted} ${rates.aud.formatted}`;

        if (rates.notifier) {
            rates.notifier();
        }
    }
    console.log(message, '\n');
}

function poll() {
    notifyCurrentPrice()
        .then(() => {})
        .catch((error: Error) => {
            console.log("Error occurred!", error);
        });
}

setInterval(poll, parseInt(process.argv[4] || "2000", 10));