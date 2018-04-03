// Testing out async / await on some demo miner functions, and timing them
const crypto = require('crypto');

/** This checks if a hash has the targeted amount of leading zeros.
 * 
 * @param {String} inputStr - the input string to hash
 * @param {int/String} nonce - the nonce to append to the string
 * @param {int} targetDifficulty - the number of leading 0s to check for
 */
function isHashOnTarget(inputStr, nonce, targetDifficulty) {
    let hash = crypto.createHash('sha256');
    let guess = `${nonce}${inputStr}`;
    let guessHash = hash.update(guess);

    let hashGuessDigest = guessHash.digest('hex');
    // console.log("Hash guess = " + hashGuessDigest);

    return hashGuessDigest.substr(0, targetDifficulty) === "0".repeat(targetDifficulty);
}

/**
 * Essentially trying to hash a leading digit "nonce" 
 * with a string to find a hash with a certain amount of leading 0s
 * @param {String} inputStr - the "proof" to hash
 * @param {int} targetDifficulty - number of leading zeros to find
 */
function testMiner(inputStr, targetDifficulty) {
    let guessNonce = 0;

    while (!isHashOnTarget(inputStr, guessNonce.toString(), targetDifficulty)) {
        guessNonce++;
    }

    //return guessNonce;
    return new Promise(resolve => {
        resolve(guessNonce);
    });
}

function runMiner(inputStr, targetDifficulty) {
    let winningNonce = testMiner(inputStr, targetDifficulty);
    return winningNonce;
}

async function runMinerAsync(inputStr, targetDifficulty) {
    let winningNonce = await testMiner(inputStr, targetDifficulty);

    console.log("The 'winning' nonce is : " + winningNonce);
    return winningNonce;
}

// Demo to run a timer on 100 SHA-256 hash ops
console.time('100-elements-SHA-256');
for (let i = 0; i < 100; i++) {
    let hash = crypto.createHash('sha256');
    hash.update(i.toString());
    let digest = hash.digest('hex');
    // console.log(digest);
}
console.timeEnd('100-elements-SHA-256');

console.time('runMinerAsync() - difficulty 4');
runMinerAsync("Buy more cryptocurrency dude", 4);
console.timeEnd('runMinerAsync() - difficulty 4');

console.time('runMinerAsync() - difficulty 5');
runMinerAsync("Buy more cryptocurrency dude", 5);
console.timeEnd('runMinerAsync() - difficulty 5');
