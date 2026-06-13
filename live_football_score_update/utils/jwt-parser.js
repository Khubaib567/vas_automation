const crypto = require('crypto');

// Generate 64 random bytes (512 bits) and convert to a hexadecimal string.
// A 32-byte (256-bit) key is also common and secure.
const keyLengthInBytes = 64; 
const secret = crypto.randomBytes(keyLengthInBytes).toString('hex');

console.log('Your new, secure JWT secret key:');
console.log(secret);
