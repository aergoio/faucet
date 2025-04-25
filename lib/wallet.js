import { Wallet } from '@herajs/wallet';
import config from '../config.json' with { type: 'json' };

export default class FaucetWallet {
    constructor(options) {
        this.address = options.address;
        if (!this.address) {
            console.error('Please add configuration for local account address and password.');
        }

        this.wallet = new Wallet();
        this.wallet.useChain({chainId: config.network.chainId, nodeUrl: config.network.nodeUrl});

        this.wallet.accountManager.addAccount({ address: this.address }).then(account => {
            this.wallet.keyManager.importKey({
                account: account,
                b58encrypted: options.encprivkey,
                password: options.password
            });
        });
    }
    async send(recipient, amount) {
        console.log('Sending', amount, 'from', this.address, 'to', recipient);
        try {
            const tracker = await this.wallet.sendTransaction({ address: this.address }, {
                from: this.address,
                to: recipient,
                amount: `${amount} aer`
            });
            console.log('Sent tx:', tracker.hash);
            tracker.on('block', transaction => {
                console.log('Tx confirmed in block', transaction.data.blockhash);
            });
        } catch (error) {
            console.error('Error sending transaction:', error);
        }
    }
    async getBalance() {
        try {
            const state = await this.wallet.getClient().getState(this.address);
            return state.balance;
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }
}