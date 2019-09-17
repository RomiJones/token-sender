let nknWallet = require("nkn-wallet");

let keystoreContent = require("./keystoreContent.json");
let keystoreContentStr = JSON.stringify(keystoreContent);
let password = require("./password.json").password;


let rpcAddr = null;
if(process.env.NODE_ENV === "production") {
  rpcAddr = "https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet";
} else if(process.env.NODE_ENV === "development") {
  rpcAddr = "https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet";
} else {
  rpcAddr = "https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet";
}

nknWallet.configure({rpcAddr: rpcAddr});
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

