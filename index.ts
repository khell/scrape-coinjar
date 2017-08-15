import * as Nightmare from 'nightmare';
import notifier = require('node-notifier');

function notifyCurrentPrice() {
    return new Nightmare({ show: false }).goto('https://www.coinjar.com/trade')
        .wait('input[name="aud"]')
        .evaluate(() => document.querySelector('input[name="aud"]')['$$currentValue'])
        .end()
        .then((res: string) => {
            console.log(res);
            if (parseFloat(res) <= parseInt(process.argv[2], 10)) {
                notifier.notify({
                    title: 'CoinJar Midpoint',
                    sound: true,
                    message: res
                });
            }
        })
        .catch((error: Error) => {
            console.log("Error occurred!", error);
        });
}

function poll() {
    notifyCurrentPrice()
        .then(() => {})
        .catch((error: Error) => {
            console.log("Error occurred!", error);
        });
}

setInterval(poll, 5000);