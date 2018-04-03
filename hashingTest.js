// Looking for a hash ending in zero

const crypto = require('crypto');
const x = 5;

for (let y = 0; y < 1000; y++) {
    let hash = crypto.createHash('sha256');
    let strXY = String(x * y);
    hash.update(strXY);

    let digest = hash.digest('hex');
    // console.log(digest);

    if (digest.charAt(digest.length - 1) === "0") {
        console.log(`The SHA-256 hash of ${x} * ${y} = ${x*y} is ${digest}`);
        console.log(`The solution is y = ${y}`);

        break;
    }
}

// --**-- Original python program --**--: 

//from hashlib import sha256

//x = 5
//y = 0  # We don't know what y should be yet...

//while sha256(f'{x*y}'.encode()).hexdigest()[-1] != "0":
    //y += 1

//print(f'The solution is y = {y}')
