import FaucetQueue from './queue.js';

class QueueManager {
    constructor(options, wallet) {
        this.queue = new FaucetQueue(options.size);
        this.dripAmount = options.dripAmount;
        this.wallet = wallet;
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