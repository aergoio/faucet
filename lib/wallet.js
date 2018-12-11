import { AergoClient } from '@herajs/client';

class Wallet {
    constructor(options) {
        this.address = options.address;
        this.password = options.password;
        this.client = new AergoClient();
        if (!this.address) {
            console.error('Please add configuration for local account address and password.');
        }
    }
    send(recipient, amount) {
        console.log('sending', amount, 'to', recipient);
        this.client.accounts.unlock(this.address, this.password).then(() => {
            this.client.accounts.sendTransaction({
                from: this.address,
                to: recipient,
                amount: amount
            }).then(txhash => {
                console.log('Sent tx', txhash);
            });
        })
    }
}

export default Wallet;