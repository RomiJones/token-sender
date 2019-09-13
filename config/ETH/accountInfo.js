let keystoreContent = require("./keystoreContent.json");
let password = require("./password.json").password;
let account = new (require('web3'))().eth.accounts.decrypt(keystoreContent, password);
const privateKey = account.privateKey;
const accountAddress = account.address;
console.log(`wallet ${accountAddress} decryption success!`);
module.exports = {
  privateKey,
  accountAddress,
}

