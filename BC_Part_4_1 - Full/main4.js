const getMerkleRoot = require("..\\merkle.js").getMerkleRoot;

const {
    Blockchain,
    Transaction
} = require('./Blockchain4.js');
const Merkle = require("..\\merkle.js").Merkle;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


const mykey =
    ec.keyFromPrivate('50c963fdb1557d9caa85be8e8c8846dc31b1af8fb9d2e9e2cdf13d758a325030')
const myWalletAddress = mykey.getPublic('hex');
const micaChain = new Blockchain();
const tx1 = new Transaction(myWalletAddress, 'address2', 7);
tx1.signTransaction(mykey);
micaChain.addTransaction(tx1);
micaChain.minePendingTransaction(myWalletAddress);

console.log();
console.log('Balance of mica is', micaChain.getBalanceOfAddress(myWalletAddress));

const tx2 = new Transaction(myWalletAddress, 'address1', 2);
tx2.signTransaction(mykey);
micaChain.addTransaction(tx2);
micaChain.minePendingTransaction(myWalletAddress);

console.log();
console.log('Balance of mica is', micaChain.getBalanceOfAddress(myWalletAddress));
//Uncomment tampering
//micaChain.chain[1].transactions[0].amount = 10;

console.log();
console.log('Blockchain valid?', micaChain.isChainValide() ? 'yes' : 'no');
console.log(JSON.stringify(micaChain, null, 4));

console.log("merkle root of first block: ", getMerkleRoot(micaChain.chain[1]));
