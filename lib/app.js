import request from 'request';
import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import bodyParser from 'body-parser';
import config from '../config.json';
import { Address } from '@herajs/client';
import Blockchain from './blockchain';

function setupAppWithQueueManager(queueManager) {
    const app = express();
    const blockchain = new Blockchain();

    const defaultContext = {
        dripAmount: config.dripAmount,
        dripInterval: config.dripInterval,
        queueSize: config.queueSize,
        networkName: 'disconnected, please wait'
    };

    blockchain.getChainInfo().then(chainInfo => {
        defaultContext.chainInfo = chainInfo;
        console.log('Received chainInfo', chainInfo.chainid);
        if (chainInfo.chainid.magic) {
            defaultContext.networkName = chainInfo.chainid.magic;
        } else {
            defaultContext.networkName = `${chainInfo.chainid.public?'public':'private'} ${chainInfo.chainid.mainnet?'mainnet':'non-mainnet'}`;
        }
    });

    app.set('view engine', 'pug');

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/static', express.static(path.join(__dirname, '../static')))

    app.get('/', async (req, res) => {
        let address = "";
        let error;
        let next = "";
        if (req.query.address) {
            try {
                const a = new Address(req.query.address);
                address = a.toString();
            } catch(e) {
                error = "The provided address is invalid.";
            }
        }
        if (req.query.next && isValidNextUrl(req.query.next)) {
            next = req.query.next;
        }
        const context = {
            address,
            error,
            next,
        };
        res.render('index', {...defaultContext, ...context});
    });

    app.get('/status', async (req, res) => {
        let balance = 0;
        let faucetError = '';
        try {
            balance = await queueManager.wallet.getBalance();
        } catch(e) {
            faucetError = '' + e;
        }
        const context = {
            faucet: {
                address: queueManager.wallet.address,
                addressShort: shortAddress(queueManager.wallet.address),
                addressUrl: getAergoscanUrl(`account/${queueManager.wallet.address}`),
                balance,
                error: faucetError
            },
            queue: {
                length: queueManager.queue.count()
            },
        };
        res.render('status', {...defaultContext, ...context});
    });

    const requestLimiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minute window
        max: 5, // start blocking after 5 requests
        message: "Too many requests from this IP, please try again after 5 minutes"
    });

    app.post('/request', requestLimiter, (req, res) => {
        let next = "";
        if (req.body.next && isValidNextUrl(req.body.next)) {
            next = req.body.next;
        }

        // check captcha
        request.post(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                form: {
                    secret: '6LdoBoAUAAAAABuotgUNrTIusUcr1uwOT97jDh5j',
                    response: req.body['g-recaptcha-response']
                }
            },
            (error, response, body) => {
                var data = JSON.parse(body);
                if (error || response.statusCode != 200 || !data.success) {
                    if (data.hasOwnProperty('error-codes')) {
                        error = "Captcha verification failed: " + data['error-codes'].join(', ');
                    }
                    res.render('index', { error, next, ...defaultContext });
                    return;
                }
                const expectedWaiting = queueManager.addRequest({
                    address: req.body.address
                });
                const expectedWaitingFormatted = formatDuration(expectedWaiting);
                res.render('request-success', {
                    expectedWaitingFormatted,
                    aergoscanUrl: getAergoscanUrl(`account/${req.body.address}`),
                    next,
                    hasNext: !!next
                });
            }
        );
    });

    return app;
}

function isValidNextUrl(url) {
    return url.match(/^(owallet|https?):\/\//);
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000);
    if (minutes > 0) return `${minutes} minutes, ${seconds} seconds`;
    return `${seconds} seconds`;
}

function getAergoscanUrl(path) {
    const baseUrl = config.explorerUrl || 'https://testnet.aergoscan.io';
    return `${baseUrl}/${path}`;
}

function shortAddress(addr) {
    addr = '' + addr;
    if (!addr) return 'Contract Creation';
    if (addr.length <= 12) return addr;
    return addr.substr(0, 8) + '...' + addr.substr(addr.length-4);
}

export default setupAppWithQueueManager;