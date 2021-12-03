const SHA256 = require(".\\BC_Part_4_1 - Full\\node_modules\\crypto-js\\sha256");
const {
    Block,
    Transaction
} = require('.\\BC_Part_4_1 - Full\\Blockchain4.js');

function getMerkleRoot(block){
    
    // deal with empty block
    if (block.transactions.length == 0){
        return "0";
    }
    
    // create array of hashes of the block transactions
    let hashes = [];
    for (const tx of block.transactions) {
        hashes.push(tx.calculateHash());
    }
 
    // calculate next level of hashes until we get a single hash, aka the root
    while (hashes.length > 1) {
        // deal with odd number of hashes by duplicating one of them
        if (hashes.length & 1) {
            hashes.push(hashes.at(-1));
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

module.exports = {getMerkleRoot};