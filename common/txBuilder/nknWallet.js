let rpcAddr = null;
if(process.env.NODE_ENV === "production") {
    rpcAddr = "https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet";
} else if(process.env.NODE_ENV === "development") {
    rpcAddr = "https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet";
} else {
    rpcAddr = "https://mainnet-rpc-node-0001.nkn.org/mainnet/api/wallet";
}

let accountInfoNKN = require('../../config/NKN/accountInfoNKN');
let instanceNKNWallet = accountInfoNKN.instanceNKNWallet;

module.exports = {
    instanceNKNWallet
}
