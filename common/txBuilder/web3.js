let infuraProviderUrl = null;
if(process.env.NODE_ENV === "production") {
    infuraProviderUrl = 'https://mainnet.infura.io/v3/5fd35273805248e988f3019aae2402e0'
} else if(process.env.NODE_ENV === "development") {
    infuraProviderUrl = 'http://ethapigeth.amous.io'
} else {
    infuraProviderUrl = 'http://ethapigeth.amous.io'
}

let Web3 = require('web3');

const accountConfig = require('../../config/ETH/accountInfo');
const OPTIONS = {
    defaultBlock :"latest",
    transactionConfirmationBlocks: 2,
    transactionBlockTimeout: 6
}

//let web3Instance = new Web3(new Web3.providers.HttpProvider(infuraProviderUrl))
let web3Instance = new Web3(infuraProviderUrl, null, OPTIONS);
const account = web3Instance.eth.accounts.wallet.add(accountConfig.privateKey)

module.exports = {
  Web3,
  web3Instance,
  account,
}
