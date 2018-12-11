import setupAppWithQueueManager from './lib/app';
import QueueManager from './lib/queue-manager';
import config from './config.json';

const queueManager = new QueueManager({
    size: config.queueSize,
    dripAmount: config.dripAmount,
    wallet: config.wallet,
    interval: config.dripInterval
});

const port = 3000;

const app = setupAppWithQueueManager(queueManager);

queueManager.start();

app.listen(port, () => console.log(`Server listening on port ${port}`));