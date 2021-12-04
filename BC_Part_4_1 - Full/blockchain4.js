const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const MAX_TX_PER_BLOCK = 4;
const eaterAddress = '0xDEAD';
const BEGINNING_BALANCE = 100;


class Transaction {
    constructor(fromAddress, toAddress, amount, timestamp=null, signature=null) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        if(!timestamp){
            this.timestamp = Date.now();
        } else{
            this.timestamp = timestamp;
        }
        this.signature = signature;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString();
    }
    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transaction for other wallets');
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }
    isValid() {
        if (this.fromAddress === null) return true;
        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

    static class(obj) {
        const tx = new Transaction(obj.fromAddress, obj.toAddress, obj.amount, obj.timestamp, obj.signature);
        return tx;
      }
}




class Block {
    
    constructor(timestamp, transactions, previousHash = '', previousNumber = -1) {

        var bloom = require('./bloomfilter.js');

        this.previousHash = previousHash;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
        this.number = previousNumber + 1;

        this.filter = new bloom(transactions.length);  //creates and populates a bloomfilter with the transactions
        for (var i = 0; i < transactions.length; i++)
        {
            this.filter.add(transactions[i]);
            
        }
        
    }


    BloomFilterTransactionCheck(transactionID) { //checks if a transaction exists using the bloom filter (still needs the merkle tree application after it returns true)
        
        //to do use the merkel root function maybe send the block to this function as well and and compare it's merkel roots to getMerkleRoot(this)?

        if (!(this.filter.test(transactionID)))
            return false;
        else
            for (var i = 0; i < this.transactions.length; i++){ //this part is just a place holder for now needs to be done with merkel tree and merkel root application
                if (this.transactions[i] == transactionID)
                    return true;
            }
        return false;
            
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp +
            JSON.stringify(this.transactions) + this.nonce).toString();
    }
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined" + this.hash);
    }
    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
    
}
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.pendingBurnTransactions = [];
        this.miningReward = 10;
        this.maxTXPerBlock = 4;

    }

    createGenesisBlock() {
        return new Block("01/01/2019", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /*addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }*/
    minePendingTransaction(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        const transactionsForBlock = []
        transactionsForBlock.push(rewardTx);
        // get first k pending transactions, k is number of allowed transactions per block minus one to leave space for the reward tx  
        for (let i = 0; i < this.maxTXPerBlock - 1 && this.pendingTransactions.length; i++){
            const pending = this.pendingTransactions.shift();
            const toBurn = this.pendingBurnTransactions.shift();
            transactionsForBlock.push(pending);
            console.log("Adding from pending: ", pending);
            transactionsForBlock.push(toBurn);
            console.log("Adding from burn: ", toBurn);
        }
        let block = new Block(Date.now(), transactionsForBlock, this.getLatestBlock().hash, this.getLatestBlock().number);
        block.mineBlock(this.difficulty);
        console.log('block succefully mined');
        this.chain.push(block);
    }
    getBalanceOfAddress(address) {
        let balance = BEGINNING_BALANCE;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }


    burn(fromAddress, feeAmount) {
        const tx = new Transaction(fromAddress, eaterAddress, feeAmount);
        this.pendingBurnTransactions.push(tx);
    }

    /************ add transaction */
    //creatTransaction(transaction) { 
    //    this.pendingTransactions.push(transaction);
    //}
    addTransaction(transaction, key) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }
        const balance = this.getBalanceOfAddress(transaction.fromAddress);
        // console.log('Balance: ', balance, ". Transaction amount: ", transaction.amount);
        const fee = this.getLatestBlock().number + 1;
        if(balance < transaction.amount + fee){ 
            throw new Error('Cannot add invalid transaction, sender doesn\'t have a high enough balance to cover it.\nBalance: ', balance, ". Transaction amount: ", transaction.amount);
        }
        this.pendingTransactions.push(transaction);
        this.burn(transaction.fromAddress, fee);
    }

    isChainValide() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;