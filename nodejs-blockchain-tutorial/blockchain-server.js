// npm component imports:
const express = require('express');
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');

var app = express();
app.use(bodyParser.json());
var nodeUUID = uuidv4(); // generate UUID for this node

// TODO - need to import the blockchain class?
var blockchain = new Blockchain();

// Set up API endpoints

// "Mine" a block
app.get('/mine', function(req, res) {
    // We run the proof of work algorithm to get the next proof...
    let last_block = blockchain.getLastBlock();
    let lastProof = last_block.proof;
    let proof = blockchain.proof_of_work(lastProof);

    // Assign a mining reward for finding the proof
    blockchain.newTransaction("Miner-Reward", nodeUUID, 1);

    // Forge the new Block by adding it to the chain
    let previousHash = Blockchain.hashBlock(last_block);
    let block = blockchain.generateNewBlock(proof, previousHash);

    let response = {
        message: "New Block Forged",
        index: block.index,
        transactions: block.transactions,
        proof: block.proof,
        previous_hash: block.previous_hash,
    };

    return res.status(200).send(JSON.stringify(response));
});

app.get('/chain', function(req, res) {
    let response = {
        chain: blockchain.chain,
        chainLength: blockchain.chain.length,
    };

    res.status(200).send(JSON.stringify(response));
});

// Resolve nodes, consensus algo - make sure everyone has the same valid chain
app.get('/nodes/resolve', function(req, res) {
    blockchain.resolveConflicts(function(wasReplaced) {
        let response;

        if (wasReplaced) {
            response = {
                message: "Our chain was replaced",
                new_chain: blockchain.chain
            };
        } else {
            response = {
                message: "Our chain is authoritative",
                chain: blockchain.chain
            };
        }

        return res.status(200).send(response);
    });
});
    
/** Create/register a new transaction
 * Example POST data to send:
 * {
      "sender": "my address",
      "recipient": "someone else's address",
      "amount": 5
    }
 */
app.post('/transaction/new', function(req, res) {
    // Check that the required fields are in the POST'ed data 
    if (!req.body.sender || !req.body.recipient || !req.body.amount) {
        return res.status(404).send("Error, missing POST request value(s)");
    }

    let index = blockchain.newTransaction(req.body.sender, req.body.recipient, req.body.amount);
    let response = {
        message: `Transaction will be added to Block ${index}`
    };

    return res.status(201).send(JSON.stringify(response));
});

/** Register a new node
 * Example POST data to send:
 * {
 *  "nodes": ["http://localhost:5001", "http://localhost:5002"]
 * }
 */ 
app.post('/nodes/register', function(req, res) {
    if (!req.body.nodes) {
        return res.status(400).send("Error: Please supply a valid list of nodes");
    }

    let nodesList = req.body.nodes;
    nodesList.forEach(function(node) {
        blockchain.registerNode(node);
    });

    let response = {
        message: "New nodes have been added",
        total_nodes: Array.from(blockchain.nodes)
    };

    return res.status(201).send(response);
});

// Set the port number and start the server:
// Example usage: 'node blockchain.js 5002'
let port;
if (process.argv[2] && process.argv[2] > 0 && process.argv[2] < 66666) {
    port = process.argv[2];
} else {
    port = 5000;
}

app.listen(port, function() {
  console.log('blockchain-server.js is running on port', port);
});
