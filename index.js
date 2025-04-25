import setupAppWithQueueManager from './lib/app.js';
import QueueManager from './lib/queue-manager.js';
import FaucetWallet from './lib/wallet.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));

const wallet = new FaucetWallet(config.wallet);

const queueManager = new QueueManager({
    size: config.queueSize,
    dripAmount: config.dripAmount,
    interval: config.dripInterval
}, wallet);

const port = config.port || 3000;

const app = setupAppWithQueueManager(queueManager);

queueManager.start();

app.listen(port, () => console.log(`Server listening on port ${port}`));