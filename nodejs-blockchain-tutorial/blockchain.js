// Standard node imports
const crypto = require('crypto');
const URL = require('url');

// npm component imports:
const express = require('express');
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
const request = require('request');


/** Blockchain class
 * Constructor - no parameters needed
 */
class Blockchain {
    constructor() {
        this.chain = [];
        this.current_transactions = [];
        this.nodes = new Set();

        // create the genesis block
        this.generateNewBlock(100, "1");
    }
    
    /** Create a new block in the blockchain
     * 
     * @param {int} proof - the proof given by the PoW algorithm
     * @param {string} previousHash - Optional; 
     * @returns {Object} - new block
     */
    generateNewBlock(proof, previousHash = null) {
        let block = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.current_transactions,
            proof: proof,
            previous_hash: previousHash || this.hashBlock(this.chain[-1])
        };

        // reset current list of transactions
        this.current_transactions = [];
        this.chain.push(block);

        return block;
    }

    /** Creates a new transaction to go into the next mined block.
     * 
     * @param {string} senderAddr - Address of the Sender 
     * @param {string} receiverAddr - Address of the recipient
     * @param {int} amount - amount to spend
     * @returns {int} The index of the block that will hold this transaction
     */
    newTransaction(senderAddr, receiverAddr, amount) {
        this.current_transactions.push({
            sender: senderAddr,
            recipient: receiverAddr,
            amount: amount
        });

        // return block index:
        let lastBlock = this.getLastBlock();
        return lastBlock.index + 1;
    }

    /** Add/register a new node to the list of nodes
     * 
     * @param {String} address  - Address of the node, eg 'http://localhost:5000'
     * @returns Nothing
     */
    registerNode(address) {
        let parsedUrl = URL.parse(address);
        //console.log("parsedUrl.href = " + parsedUrl.href);
        this.nodes.add(parsedUrl.href);
    }

    /** Determine if a given blockchain is valid
     * 
     * @param {Array} chain - a blockchain array
     * @returns {Boolean} True if valid, false if not
     */
    isValidChain(chain) {
        let previousBlock = chain[0];
        // console.log("\n previousBLock = " + JSON.stringify(previousBlock));
        let currentIndex = 1; 

        while (currentIndex < chain.length) {
            let block = chain[currentIndex];
            // console.log(previousBlock);
            // console.log(block);
            // console.log("\n----------------------\n");

            // check that the hash of the last block is correct
            if (block.previous_hash != this.constructor.hashBlock(previousBlock)) {
                console.log("isValisChain() - invalid hash, returning false");
                return false;
            }

            // Check that the Proof-of-Work is correct
            if (!this.constructor.isValidProof(previousBlock.proof, block.proof)) {
                console.log("isValidChain() - invalid PoW, returning false");
                return false;
            }

            previousBlock = block;
            currentIndex++;
        }

        return true;
    }

    /** Consensus Algorithm
     * This is our consensus algorithm, it resolves conflicts
     * by replacing our chain with the longest (valid?) one in the network.
     * 
     * @returns {Boolean} True if our chain was replaced, false otherwise
     */
    resolveConflicts(callbackFn) {
        let self = this;
        let neighbors = this.nodes;
        let newChain = null;
        let maxLength = this.chain.length; // we're only looking for chains longer than ours
        let completedRequests = 0;

        // Grab and verify the chains from all the nodes in our network
        neighbors.forEach(function(node) {
            // console.log(`ResolveConflicts(): ${node}chain`);
            request(`${node}chain`, function(error, response) {
                completedRequests++;

                if (!error && response.statusCode == 200) {
                    let serverResponse = JSON.parse(response.body);
                    let chain = serverResponse.chain;
                    let chainLength = serverResponse.chainLength; // pulling the length property 

                    // Check if the length is longer and the chain is valid
                    if (chainLength > maxLength && self.isValidChain(chain)) {
                        maxLength = chainLength;
                        newChain = chain;
                    }

                    // Call the callback function when done cycling through all the neighbor nodes
                    if (completedRequests == neighbors.size) {
                        // Replace our chain if we discovered a new, valid chain longer than ours
                        if (newChain) {
                            // console.log("resolveConflicts() returning true");
                            self.chain = newChain;
                            callbackFn(true);
                        } else {
                            // console.log("resolveConflicts() returning false");
                            callbackFn(false);
                        }
                    }
                }
            });
        });
    }

    /** Get and return the last block in the chain
     * @returns {Object} - The last block in the chain
     */
    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }
        
    /** Creates a SHA-256 hash of a block
     * 
     * @param {Object} block 
     * @returns {string}
     */
    static hashBlock(block) {
        let hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(block));

        return hash.digest('hex');
    }

    /** Validates the proof: Does hash(last_proof, proof) contain 4 leading zeros?
     * 
     * @param {int} lastProof - previous proof
     * @param {int} proof - current proof
     * @returns {Boolean} True if correct, False if not
     */
    static isValidProof(lastProof, proof) {
        let hash = crypto.createHash('sha256');
        let guess = `${lastProof}${proof}`;
        let guessHash = hash.update(guess);

        let hashGuessDigest = guessHash.digest('hex');
        //console.log("Hash guess = " + hashGuessDigest);

        return hashGuessDigest.substr(0, 4) === "0000";
    }

    /** Simple Proof of Work algorithm
     * Find a number p' such that hash(pp') contains 4 leading zeros, 
     * where p is the previous p'.
     * p is the previous proof, and p' is the new proof
     * 
     * @param {int} last_proof 
     */
    proof_of_work(last_proof) {
        let proof = 0;

        // keep incrementing the proof guess until a match is hit
        while (!this.constructor.isValidProof(last_proof, proof)) {
            proof++; 
        }

        return proof;
    }

    /* Example block 
    block = {
        'index': 1,
        'timestamp': 1506057125.900785,
        'transactions': [
            {
                'sender': "8527147fe1f5426f9dd545de4b27ee00",
                'recipient': "a77f5cdfa2934df3954a5c7c7da5df1f",
                'amount': 5
            }
        ],
        'proof': 324984774000,
        'previous_hash': "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    };
    */
}

// ---------------*******-------------

// Set up the server
var app = express();
app.use(bodyParser.json());
var nodeUUID = uuidv4(); // generate UUID for this node
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
  console.log('blockchain.js is running on port', port);
});
