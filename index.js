import setupAppWithQueueManager from './lib/app';
import QueueManager from './lib/queue-manager';
import config from './config.json';
import FaucetWallet from './lib/wallet';

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