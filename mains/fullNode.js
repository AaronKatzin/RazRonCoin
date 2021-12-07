const {
    Blockchain,
    Transaction
} = require('..\\BC_Part_4_1 - Full\\Blockchain4.js');
const EC = require('..\\BC_Part_4_1 - Full\\node_modules\\elliptic').ec;
const ec = new EC('secp256k1');
const saveListToFile = require("..\\serialize.js").saveListToFile;
const loadFileToList = require("..\\serialize.js").loadFileToList;

const topology = require('..\\BC_Part_5 p2p\\BC_Part_5 p2p\\node_modules\\fully-connected-topology')
const {
    stdin,
    exit,
    argv
} = process
const {
    log
} = console
const {
    me,
    peers
} = extractPeersAndMyPort()
const sockets = {}

log('---------------------')
log('Starting up FULL NODE')
log('me - ', me)
log('peers - ', peers)
log('connecting to peers...')

const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)
const micaChain = new Blockchain();




//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    setInterval(recurringTask, 10000, socket);
    const peerPort = extractPortFromIp(peerIp)
    log('connected to peer - ', peerPort)

    sockets[peerPort] = socket
    stdin.on('data', data => { //on user input
        const message = data.toString().trim()
        if (message === 'exit') { //on exit
            log('Bye bye')
            exit(0)
        }

        const receiverPeer = extractReceiverPeer(message)
        if (sockets[receiverPeer]) { //message to specific peer
            if (peerPort === receiverPeer) { //write only once
                sockets[receiverPeer].write(formatMessage(extractMessageToSpecificPeer(message)))
            }
        } else { //broadcast message to everyone
            socket.write(formatMessage(message))
        }
    })

    //print data when received
    socket.on('data', data => receivedData(data, socket))
})

function receivedData(data, socket){
    const jsonObj = JSON.parse(extractMessage(data.toString()))

    // check if it's a transaction
    if(jsonObj.fromAddress && jsonObj.toAddress && jsonObj.timestamp && jsonObj.signature){
        console.log('in if!!')
        receivedTransaction(data);
    }
     // check if it's a balance request
    else if(jsonObj.balanceOfAddress){
        console.log("responding with balance: ", micaChain.getBalanceOfAddress(jsonObj.balanceOfAddress));
        socket.write(formatMessage(micaChain.getBalanceOfAddress(jsonObj.balanceOfAddress)));
    }
    // check if it's a headers request
    else if(jsonObj.getHeaders){
        console.log("Got a request for headers history");
        if(micaChain.chain.length){ // check if blockchain contains any blocks
            for(const block in micaChain.chain){
                var header = micaChain.chain[block].getHeader();
                socket.write(formatMessage(header));
                sleep(500);
            }
        }
    }
    // check if it's a verification request
    else if(jsonObj.verify){
        console.log("Got a request to verify: ", jsonObj.verify);
        //TODO: actually verify the transaction and respond with proof!
    }
    


}

function receivedTransaction(data){
    console.log("received json: ",JSON.parse(extractMessage(data.toString())));
    receivedTX = Transaction.class(JSON.parse(extractMessage(data.toString())));
    micaChain.pendingTransactions = loadFileToList("..\\pending_transaction.json");
    // TODO validate
    console.log("received TX: ", receivedTX)
    micaChain.addTransaction(receivedTX);
    saveListToFile(micaChain.pendingTransactions,"..\\pending_transaction.json");
}


//extract ports from process arguments, {me: first_port, peers: rest... }
function extractPeersAndMyPort() {
    return {
        me: argv[2],
        peers: argv.slice(3, argv.length)
    }
}

//'4000' -> '127.0.0.1:4000'
function toLocalIp(port) {
    return `127.0.0.1:${port}`
}

//['4000', '4001'] -> ['127.0.0.1:4000', '127.0.0.1:4001']
function getPeerIps(peers) {
    return peers.map(peer => toLocalIp(peer))
}

//'hello' -> 'myPort:hello'
function formatMessage(message) {
    return `${me}>${message}`
}

//'127.0.0.1:4000' -> '4000'
function extractPortFromIp(peer) {
    return peer.toString().slice(peer.length - 4, peer.length);
}

//'4000>hello' -> '4000'
function extractReceiverPeer(message) {
    return message.slice(0, 4);
}

//'4000>hello' -> 'hello'
function extractMessageToSpecificPeer(message) {
    return message.slice(5, message.length);
}

function extractMessage(message){
    return message.substring(message.indexOf(">")+1,  message.length);
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

// mines pending transactions and then trnasmits the block header
function recurringTask(socket){
  console.log("here");
  if(micaChain.minePendingTransaction()){ // if there's something to mine
      var header = micaChain.getLatestBlock().getHeader();
      socket.write(formatMessage(header));
  }
}