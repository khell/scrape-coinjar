import * as Nightmare from 'nightmare';
import notifier = require('node-notifier');
import Player = require('play-sound');

const player = Player({});

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

                player.play('Morning_Flower.mp3', function(err) {
                    console.log(err);
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