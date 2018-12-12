import request from 'request';
import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import bodyParser from 'body-parser';
import config from '../config.json';

function setupAppWithQueueManager(queueManager) {
    const app = express();

    app.set('view engine', 'pug');

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/static', express.static(path.join(__dirname, '../static')))

    app.get('/', (req, res) => {
        res.render('index', {
            dripAmount: config.dripAmount,
            dripInterval: config.dripInterval,
            queueSize: config.queueSize,
            networkName: config.network.name
        });
    });

    const requestLimiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minute window
        max: 5, // start blocking after 5 requests
        message: "Too many requests from this IP, please try again after 5 minutes"
    });

    app.post('/request', requestLimiter, (req, res) => {
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
                    res.render('index', { error })
                    return;
                }
                const expectedWaiting = queueManager.addRequest({
                    address: req.body.address
                });
                const expectedWaitingFormatted = formatDuration(expectedWaiting);
                res.render('request-success', { expectedWaitingFormatted });
            }
        );
    });

    function formatDuration(ms) {
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / 60000);
        if (minutes > 0) return `${minutes} minutes, ${seconds} seconds`;
        return `${seconds} seconds`;
    }

    return app;
}

export default setupAppWithQueueManager;