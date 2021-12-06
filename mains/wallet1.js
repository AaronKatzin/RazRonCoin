const prompt = require('prompt');
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
log('Starting up WALLET NODE')
log('me - ', me)
log('peers - ', peers)
log('connecting to peers...')

const mykey =
    ec.keyFromPrivate('50c963fdb1557d9caa85be8e8c8846dc31b1af8fb9d2e9e2cdf13d758a325030')
const myWalletAddress = mykey.getPublic('hex');


const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)
const micaChain = new Blockchain();
let sending = false;

//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    const peerPort = extractPortFromIp(peerIp)
    log('connected to peer - ', peerPort)

    sockets[peerPort] = socket
    stdin.on('data', data => { //on user input
        const message = data.toString().trim()
        if (message === 'exit') { //on exit
            log('Bye bye')
            exit(0)
        }
        if(!sending){
            const receiverPeer = extractReceiverPeer(message)
            if (message === 'send') { // user wants to send money
                sending = true;
                sendTransaction(socket);
            }
            else if (message === 'balance') { // user wants to see his balance
                console.log("requesting balance by sending: ", formatMessage("{\"balanceOfAddress\":"+ myWalletAddress +"}"))
                socket.write(formatMessage("{\"balanceOfAddress\":\""+ myWalletAddress +"\"}"))
            }
            else if (sockets[receiverPeer]) { //message to specific peer
                if (peerPort === receiverPeer) { //write only once
                    sockets[receiverPeer].write(formatMessage(extractMessageToSpecificPeer(message)))
                }
            } else { //broadcast message to everyone
                socket.write(formatMessage(message))
            }
        }
    })

    //print data when received
    socket.on('data', data => log(data.toString('utf8')))
})

function sendTransaction(socket, amount, toAddress){
    const properties = [
        {
            name: 'toAddress',
            validator: /^[\da-fA-f]+$/,
            warning: 'address must be only hex numbers'
        },
        {
            name: 'amount',
            validator: /^[\d]+$/,
            warning: 'amount must be only numbers'
        }
    ];
    prompt.get(properties, function (err, result) {
        if (err) { return onErr(err); }
        console.log('Command-line input received:');
        console.log('  toAddress: ' + result.toAddress);
        console.log('  amount: ' + result.amount);
        const tx1 = new Transaction(myWalletAddress,  result.toAddress, result.amount);
        tx1.signTransaction(mykey);
        console.log("sending transaction: ", JSON.stringify(tx1));
        socket.write(formatMessage(JSON.stringify(tx1)));
        sending = false;
    });

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

function extractMessage(message){
    return messge.substring(str.indexOf(">"),  messge.length)
}

//'4000>hello' -> 'hello'
function extractMessageToSpecificPeer(message) {
    return message.slice(5, message.length);
}