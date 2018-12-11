import FaucetQueue from './queue';
import Wallet from './wallet';

class QueueManager {
    constructor(options) {
        this.queue = new FaucetQueue(options.size);
        this.dripAmount = options.dripAmount;
        this.wallet = new Wallet(options.wallet);
        this.interval = options.interval;
    }
    start() {
        console.log('Starting queue manager');
        setInterval(() => {
            this.consumeQueue();
        }, this.interval);
    }
    addRequest(request) {
        this.queue.enqueue(request);
        return this.queue.count() * this.interval; // return expected wait time
    }
    consumeQueue() {
        if (this.queue.isEmpty()) {
            console.log('queue is empty');
            return;
        }
        const request = this.queue.dequeue();
        console.log('handling request', request);
        this.wallet.send(request.address, this.dripAmount);
    }
}

export default QueueManager;