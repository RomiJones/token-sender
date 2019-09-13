let nknWallet = require("nkn-wallet");

let keystoreContent = require("./keystoreContent.json");
let keystoreContentStr = JSON.stringify(keystoreContent);
let password = require("./password.json").password;
let instanceNKNWallet = null;
try {
  instanceNKNWallet = nknWallet.loadJsonWallet(keystoreContentStr, password);
  console.log(`NKN wallet ${instanceNKNWallet.address} decryption success!`);
} catch(e) {
  console.log(e.toString());
}
module.exports = {
  instanceNKNWallet,
}

