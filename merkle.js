const SHA256 = require(".\\BC_Part_4_1 - Full\\node_modules\\crypto-js\\sha256");
const {
    Block,
    Transaction
} = require('.\\BC_Part_4_1 - Full\\Blockchain4.js');

class Merkle{
    constructor(block){
        // create array of hashes of the block transactions
        let transactionHashes = [];
        for (const tx of block.transactions) {
            transactionHashes.push(tx.calculateHash());
        }
        // set the merkle root
        this.setMerkleRoot(transactionHashes);
    }

    setMerkleRoot(hashes){
        // deal with empty block
        if (hashes.length == 0){
            return "0";
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
        // set the merkle root as the single hash, aka the root
        this.merkleRoot = hashes[0];
    }
}

module.exports.Merkle = Merkle;