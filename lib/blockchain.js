import { AergoClient } from '@herajs/client';

class Blockchain {
    constructor() {
        this.client = new AergoClient();
        this.chainInfo = null;
        this.getChainInfo();
    }
    getChainInfo(cached = true) {
        return new Promise((resolve, reject) => {
            if (cached && this.chainInfo !== null) {
                return resolve(this.chainInfo);
            }
            this.client.getChainInfo().then(chainInfo => {
                this.chainInfo = chainInfo;
                resolve(chainInfo);
            }).catch(e => {
                reject(e);
            });
        });
    }
}

export default Blockchain;