const {
    Blockchain,
    Transaction
} = require('..\\BC_Part_4_1 - Full\\Blockchain4.js');
const EC = require('..\\BC_Part_4_1 - Full\\node_modules\\elliptic').ec;
const ec = new EC('secp256k1');
const saveListToFile = require("..\\serialize.js").saveListToFile;
const loadTransactionFileToList = require("..\\serialize.js").loadTransactionFileToList;
const SHA256 = require("crypto-js/sha256");

console.log("helloworld")

var x = new Transaction(546724,10,6);
var y = new Transaction(4564,5,6);
var fy = new Transaction(8,6,6);
const transactionarray = [];
transactionarray.push(x);
transactionarray.push(y);
transactionarray.push(fy);
root=setMerkleRootTransaction(transactionarray);
testarrayreturn=ReturnMerkleTreeParts(x,transactionarray);
console.log(testarrayreturn);
console.log("y from address:",y.fromAddress);
var helpmegod = y.fromAddress + y.toAddress + y.amount + y.timestamp;
console.log("help me god var:", helpmegod);
console.log("calculate hashes y:",SHA256(helpmegod.toString()).toString());
console.log("testing calculating hashes:");
console.log("calculate hashes x:",calculateHashes(fy));
console.log("random sha256",SHA256("LOLOLFDFSFIHATETHIS").toString());
console.log("x:",x);
console.log("y",y);
var itisdone = 5+4+8;
var itisnotdone =5+4+8+12;
var temp =itisdone.toString();
var temp2 =itisnotdone.toString();
console.log("SHA256 TESTING GROUNDS 0",SHA256(itisdone).toString());
console.log("SHA256 TESTING GROUNDS 1:",SHA256(5+4+8).toString());
console.log("SHA256 TESTING GROUNDS 2:",SHA256(45+45+7+8+5+5).toString());
console.log("SHA256 TESTING GROUNDS 3:",SHA256(temp).toString());
console.log("SHA256 TESTING GROUNDS 4:",SHA256(temp2).toString());
console.log("SHA256 TESTING GROUNDS 5:",SHA256("itisdone").toString());

var x = new Transaction(546724,10,6);
var y = new Transaction(4564,5,6);

console.log("y:",y);
console.log("x:",x);



console.log("y calc hash",y.calculateHash);
console.log("x calc hash",x.calculateHash);

console.log("testing calculating hashes function now");

console.log("calculate hashes y:",calculateHashes(y));
console.log("calculate hashes x :",calculateHashes(x));


let testinteger = 5;
let teststring = "58";

console.log("testing adding string to an integer:", testinteger+teststring);
console.log("testing temp string to string", teststring.toString());

var m = x.calculateHash();
var f = y.calculateHash();

console.log("var m (which is x):", m);
console.log("var f (which is y)", f);


console.log("testing calculate hash hash of x:", x.calculateHash());
console.log("testing calculate hash hash of y:",y.calculateHash());

const TransactionsNewArray = [];
TransactionsNewArray.push(x);
TransactionsNewArray.push(y);
console.log("set merkle root test:",setMerkleRootTransaction(TransactionsNewArray) );

var xhash = x.calculateHash();
var yhash = y.calculateHash();
var TempHashStr = (xhash+yhash).toString(); // not needed
var xyhash = SHA256(xhash+yhash).toString();
console.log("xyhashtest",xyhash );

var z = new Transaction(5454,5,6);

const CheckRootArray = [];
//CheckRootArray.push(x);
//CheckRootArray.push(y);
//CheckRootArray.push(z);
CheckRootArray[0]=x;
CheckRootArray[1]=y;
CheckRootArray[2]=z;







let returningarray = [];

returningarray = ReturnMerkleTreeParts(z,CheckRootArray);


console.log("returning array size",returningarray.length);

console.log("merkle root hashed:",SHA256(returningarray[0]+returningarray[1]).toString());
console.log("merkle root hashed with setmerkleroothashed:",setMerkleRootHashed(returningarray));

console.log("return array[0]=",returningarray[0]);
console.log("return array[1]=",returningarray[1]);

var zhash = z.calculateHash();
 // not needed
var zzhash = SHA256(zhash+zhash).toString();

console.log("hashing trans 0 and 1 should be equal to returningarray[0]",xyhash)
console.log("hashing trans 0 and 1 should be equal to returningarray[1]",zzhash)
console.log("hashing xy hash and zz hash",SHA256(xyhash+zzhash).toString());
console.log("checking the merkle hash of checkrootarray",setMerkleRootTransaction(CheckRootArray));

const CheckRootArraySize2 = [];
CheckRootArraySize2[0]=x;
CheckRootArraySize2[1]=y;
console.log("checking the merkle hash of checkrootarray2",setMerkleRootTransaction(CheckRootArraySize2));
let returningarray2 = [];
returningarray2 = ReturnMerkleTreeParts(x,CheckRootArraySize2);
console.log("return array with positive numbers don't bug out hmm a bug",returningarray2[0]);

























function setMerkleRootTransaction(transactions) {

    // deal with empty block
    if (transactions.length == 0) {
        return "0";
    }

    // create array of hashes of the block transactions
    let hashes = [];
    for (const tx of transactions) {
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
        for (let i = 0; i < hashes.length; i += 2) {
            let TempString = (hashes[i] + hashes[i + 1]).toString();
            nextLevel.push(SHA256(TempString).toString());
        }
        // replace curr level of hashes with next level of hashes for next while iteration
        hashes = nextLevel;
    }
    // return single hash, aka the root
    return hashes[0];
}
function setMerkleRootHashed(transactions) {

    // deal with empty block
    if (transactions.length == 0) {
        return "0";
    }

    
    

    // calculate next level of hashes until we get a single hash, aka the root
    while (transactions.length > 1) {
        // deal with odd number of hashes by duplicating one of them
        if (transactions.length & 1) {
            transactions.push(transactions[-1]);
        }
        let nextLevel = [];
        // calculate next level of hashes
        for (let i = 0; i < transactions.length; i += 2) {
            let TempString = (transactions[i] + transactions[i + 1]).toString();
            nextLevel.push(SHA256(TempString).toString());
        }
        // replace curr level of hashes with next level of hashes for next while iteration
        transactions = nextLevel;
    }
    // return single hash, aka the root
    return transactions[0];
}

function ReturnMerkleTreeParts(tx,txarray)
{
    console.log("array length:",txarray.length);
    if (txarray.length==3)
    {
        if ((tx==txarray[0])||(tx==txarray[1])){
            console.log("hello in if");
            let temparray=[];
            temparray.push(txarray[2]);
            temparray.push(txarray[2]);
            let combinedhash=setMerkleRootTransaction(temparray);
            let returnarray=[];
            returnarray[0]=txarray[0].calculateHash();
            returnarray[1]=txarray[1].calculateHash();
            returnarray[2]=combinedhash;
            return returnarray;



        }
        if (tx==txarray[2]){
            console.log("hello in if tx==2");
            let temparray1=[];
            temparray1.push(txarray[0]);
            temparray1.push(txarray[1]);
            let combinedhash1=setMerkleRootTransaction(temparray1);

            let temparray2=[];
            temparray2.push(txarray[2]);
            temparray2.push(txarray[2]);
            let combinedhash2=setMerkleRootTransaction(temparray2);
            let returnarray=[];
            returnarray[0]=combinedhash1;
            returnarray[1]=combinedhash2;
            return returnarray;


        }

       
        
            



    }
    if (txarray.length==2)
    {
        console.log("hello in txarraylength==2");
        let combinedhash=setMerkleRootTransaction(txarray);
        let returnarray=[];
        returnarray.push(combinedhash);
        return returnarray;
    }
}
function calculateHashes(f) {
    var temp = (f.fromAddress + f.toAddress + f.amount + f.timestamp).toString();
   
        return SHA256(temp).toString();
    }