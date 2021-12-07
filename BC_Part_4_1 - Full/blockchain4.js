const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const fs = require('fs');

const MAX_TX_PER_BLOCK = 4;
const eaterAddress = '0xDEAD';
const BEGINNING_BALANCE = 100;

function saveListToFile(list, file){
    // console.log("received list to save: ", list);
    const jsonified = JSON.stringify(list);
    try {
        fs.writeFileSync(file, jsonified);
        // console.log("JSON data is saved to file:\n", jsonified);
    } catch (error) {
        console.error("Failed to save list due to: ", err);
    }
    /*for(var obj in list){
        const jsonified = JSON.stringify(list[obj]);
        console.log("converting to JSON: ", list[obj]); 
        try {
            fs.writeFileSync(file, jsonified);
            console.log("JSON data is saved to file:\n", jsonified);
        } catch (error) {
            console.error(err);
        }
    }*/
}

function loadFileToList(file){
    // load JSON Object list
    const objectList = JSON.parse(fs.readFileSync(file));
    const txList = [];
    //convert to strongly-typed transactions 
    for(obj in objectList){
        txList.push(Transaction.class(objectList[obj]));
    }
    return txList;
}



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
    
    constructor(timestamp, transactions, previousHash = '', previousNumber = -1, prevMerkleRoot = '', prevNonce = 0) {

        var bloom = require('./bloomfilter.js');
        this.timestamp = timestamp;
        this.previousHash = SHA256(previousHash + prevMerkleRoot + prevNonce);
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
        this.number = previousNumber + 1;
        if(transactions == "Genesis block"){
            this.merkleRoot = SHA256("Genesis block");
        } else {
            this.setMerkleRoot();
        }

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
    setMerkleRoot(){
    
        // deal with empty block
        if (this.transactions.length == 0){
            return "0";
        }
        
        // create array of hashes of the block transactions
        let hashes = [];
        for (const tx of this.transactions) {
            hashes.push(tx.calculateHash());
        }
     
        // calculate next level of hashes until we get a single hash, aka the root
        while (hashes.length > 1) {
            // deal with odd number of hashes by duplicating one of them
            if (hashes.length & 1) {
                hashes.push(hashes[-1]);
            }
            let nextLevel = [];
            // calculate next level of hashes
            for (let i = 0; i < hashes.length; i+=2) { 
                nextLevel.push(SHA256(hashes[i] + hashes[i+1]).toString());
            }
            // replace curr level of hashes with next level of hashes for next while iteration
            hashes = nextLevel;
        }
        // return single hash, aka the root
        this.merkleRoot = hashes[0];
    }
    getHeader(){
        return JSON.stringify({"previousHash": String(this.previousHash) , "timestamp" : String(this.timestamp), "nonce" : String(this.nonce), "merkleRoot": String(this.merkleRoot)})
                
    }
    
}
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
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
    minePendingTransaction(miningRewardAddress = eaterAddress) {
        console.log("mining pending transactions");
        // load pending transactions from mempool
        this.pendingTransactions = loadFileToList("..\\pending_transaction.json");
        
        if(this.pendingTransactions.length){
            console.log("Found pending transactions to mine")
            const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
            const transactionsForBlock = []
            transactionsForBlock.push(rewardTx);
            // get first k pending transactions, k is number of allowed transactions per block minus one to leave space for the reward tx  
            for (let i = 0; i < this.maxTXPerBlock - 1 && this.pendingTransactions.length; i++){
                const pending = this.pendingTransactions.shift();
                transactionsForBlock.push(pending);
                console.log("Adding from pending: ", pending);
            }
            let block = new Block(Date.now(), transactionsForBlock, this.getLatestBlock().hash, this.getLatestBlock().number, this.getLatestBlock().merkleRoot, this.getLatestBlock().nonce);
            block.mineBlock(this.difficulty);
            console.log('block succefully mined');
            this.chain.push(block);
            // save remaining pending transactions from mempool
            saveListToFile(this.pendingTransactions,"..\\pending_transaction.json");
            return true;
        }
        else{
            console.log("No pending transactions to mine");
            return false;
        }
    }
    getBalanceOfAddress(address) {
        let balance = BEGINNING_BALANCE;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress == address) {
                    balance -= parseInt(trans.amount);
                }
                if (trans.toAddress == address) {
                    balance += parseInt(trans.amount);
                }
            }
        }
        return balance;
    }


    burn(fromAddress, feeAmount, transactionAmount) {
        const balance = this.getBalanceOfAddress(fromAddress);
        // console.log('Balance: ', balance, ". Transaction amount: ", transaction.amount);
        if(balance < parseInt(transactionAmount) + parseInt(feeAmount)){ 
            console.log('Cannot add burn transaction, sender doesn\'t have a high enough balance to cover it.\nBalance: ', balance, ". Burn amount: ", feeAmount);
            return false;
        }
        const tx = new Transaction(fromAddress, eaterAddress, feeAmount);
        this.pendingTransactions.push(tx);
        return true;
    }

    /************ add transaction */
    //creatTransaction(transaction) { 
    //    this.pendingTransactions.push(transaction);
    //}
    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            console.log('Transaction must include from and to address');
            return false;
        }
        if (!transaction.isValid()) {
            console.log('Cannot add invalid transaction to chain');
            return false;
        }
        const balance = this.getBalanceOfAddress(transaction.fromAddress);
        // console.log('Balance: ', balance, ". Transaction amount: ", transaction.amount);
        const fee = this.getLatestBlock().number + 1;
        if(balance < parseInt(transaction.amount) + parseInt(fee)){ 
            console.log('Cannot add invalid transaction, sender doesn\'t have a high enough balance to cover it.\nBalance: ', balance, ". Transaction amount: ", transaction.amount, ". Fee: ", fee);
            return false;
        }
        if(this.burn(transaction.fromAddress, fee, transaction.amount)){ // make sure sender has enough money to cover gas fee
            this.pendingTransactions.push(transaction);
            return true;
        }
        return false;
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
function getMerkleRootOfTXArray(TXarray){ //instead of giving it a block here we give it a 
    //tx array
// deal with empty block
if (TXarray.length == 0){
return "0";
}

// create array of hashes of the block transactions
let hashes = [];
for (const tx of TXarray) {
hashes.push(tx.calculateHash());
}

// calculate next level of hashes until we get a single hash, aka the root
while (hashes.length > 1) {
// deal with odd number of hashes by duplicating one of them
if (hashes.length & 1) {
hashes.push(hashes[-1]);
}
let nextLevel = [];
// calculate next level of hashes
for (let i = 0; i < hashes.length; i+=2) { 
nextLevel.push(SHA256(hashes[i] + hashes[i+1]).toString());
}
// replace curr level of hashes with next level of hashes for next while iteration
hashes = nextLevel;
}
// return single hash, aka the root
return hashes[0];
}

module.exports = { getMerkleRootOfTXArray };
module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;

