var bloom = require('./bloomfilter.js');
const {
    Blockchain,
    Transaction
} = require('..\\BC_Part_4_1 - Full\\Blockchain4.js');
const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//arguments:
//1.probable number of elements in the filter.
//2.optional false_postive_tolerance argument
var filter = new bloom(100); 

const mykey =
    ec.keyFromPrivate('50c963fdb1557d9caa85be8e8c8846dc31b1af8fb9d2e9e2cdf13d758a325030')
const myWalletAddress = mykey.getPublic('hex');
Tx1 = new Transaction(myWalletAddress, "Aaron", 10);
Tx1.signTransaction(mykey);
Tx1Hash = Tx1.calculateHash();

filter.add("razi");
filter.add("aaron");
filter.add("banana");
filter.add("apple");
filter.add(Tx1Hash);

console.log(filter.test("apple"));	//true		
console.log(filter.test("orange"));	//false
console.log(filter.test("razi"));	//true
console.log(filter.test("aaron"));	//true
console.log(filter.test("banana")); //true
console.log(filter.test("banana1")); //false
console.log(filter.test(Tx1Hash)); //true?

//serialization
var json = filter.serialize();

//deserialization
var deserialized_filter = bloom.deserialize(json);