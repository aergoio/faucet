class FaucetQueue {
    constructor(size) {
        this.queue = [];
        this.size = size;
    }
    enqueue(request) {
        if (this.queue.length >= this.size) {
            throw Error('queue is full');
        }
        this.queue.push(request);
    }
    dequeue() {
        return this.queue.shift();
    }
    count() {
        return this.queue.length;
    }
    isEmpty() {
        return (this.queue.length === 0);
    }
    isFull() {
        return (this.queue.length >= this.size);
    }
}

export default FaucetQueue;