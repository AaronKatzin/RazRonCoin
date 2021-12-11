const {
    Blockchain,
    Transaction
} = require('./Blockchain4.js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const saveListToFile = require("..\\serialize.js").saveListToFile;
const loadTransactionFileToList = require("..\\serialize.js").loadTransactionFileToList;


const mykey =
    ec.keyFromPrivate('50c963fdb1557d9caa85be8e8c8846dc31b1af8fb9d2e9e2cdf13d758a325030')
const myWalletAddress = mykey.getPublic('hex');
const RazRonCoin = new Blockchain();
const tx1 = new Transaction(myWalletAddress, 'address2', 7);
tx1.signTransaction(mykey);
RazRonCoin.addTransaction(tx1);
const tx3 = new Transaction(myWalletAddress, 'address2', 10);
tx3.signTransaction(mykey);
RazRonCoin.addTransaction(tx3);
// test serialization and de-serialization
saveListToFile(RazRonCoin.pendingTransactions, "pending_transaction.json");
RazRonCoin.pendingTransactions = loadTransactionFileToList("pending_transaction.json");
// END test serialization and de-serialization
RazRonCoin.minePendingTransaction(myWalletAddress);

console.log();
console.log('Balance of mica is', RazRonCoin.getBalanceOfAddress(myWalletAddress));

const tx2 = new Transaction(myWalletAddress, 'address1', 2);
tx2.signTransaction(mykey);
RazRonCoin.addTransaction(tx2);
RazRonCoin.minePendingTransaction(myWalletAddress);

console.log();
console.log('Balance of mica is', RazRonCoin.getBalanceOfAddress(myWalletAddress));
//Uncomment tampering
//RazRonCoin.chain[1].transactions[0].amount = 10;

console.log();
console.log('Blockchain valid?', RazRonCoin.isChainValide() ? 'yes' : 'no');
console.log(JSON.stringify(RazRonCoin, null, 4));

console.log("merkle root of first block: ", getMerkleRoot(RazRonCoin.chain[1].transactions));