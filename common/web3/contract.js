const decimal = require('decimal.js')

const contractConfig = require('../../config/ETH/contractConfig')
const accountConfig = require('../../config/ETH/accountInfo')
const supportedTokensERC20 = require('../../config/ETH/supportedTokens')

const promiseRet = require('../../common/promiseRet')
const msg = require('../../common/message')

const dbServer = require('../../api/dbInterface')

const web3Instance = require('./web3').web3Instance
const account = require('./web3').account

let buildTransferTask = require('../../tasks/transferTasks').buildTransferTask

const abi = contractConfig.erc20ABI;
const walletAddress = accountConfig.accountAddress

async function TransferToken(tokenSymbol, to, amount) {
  let inputInfo = `[transferToken(tokenSymbol=${tokenSymbol}, to=${to}, amount=${amount})]`;
  console.log(inputInfo);

  let gasPrice = await web3Instance.eth.getGasPrice().catch(_=>{
      return 15 * 1e9
  })
  gasPrice = Math.floor(gasPrice * 1.4);

  let rawTransaction = null;
  if(tokenSymbol == "ETH") {
      let amountInEth = ''
      try {
          decimal.set({ toExpPos: 40 })
          amountInEth = new decimal(amount).mul(decimal.pow(10, 18)).floor().toString();
      } catch (e) {
          return promiseRet.Error(msg.codes.CAN_NOT_MAKE_NONCE, `amount is not valid ${inputInfo}`, e);
      }

      rawTransaction = {
          "from":walletAddress,
          "to": to,
          "gasLimit": web3Instance.utils.toHex(21000),
          "value": amountInEth,
          "gasPrice":gasPrice
      }
  } else {
      let tokenDetail = supportedTokensERC20.getToken(tokenSymbol);
      let contract = new web3Instance.eth.Contract(
          abi,
          tokenDetail.contractAddr,
          {from: walletAddress}
      );

      let amountInEth = ''
      try {
          decimal.set({ toExpPos: 40 })
          amountInEth = new decimal(amount).mul(decimal.pow(10, tokenDetail.decimals)).floor().toString();
      } catch (e) {
          return promiseRet.Error(msg.codes.CAN_NOT_MAKE_NONCE, `amount is not valid ${inputInfo}`, e);
      }

      rawTransaction = {
          "from": walletAddress,
          "gasPrice": web3Instance.utils.toHex(gasPrice),
          "gasLimit": web3Instance.utils.toHex(60000),
          "to": tokenDetail.contractAddr,
          "value": "0x0",
          "data": contract.methods.transfer(to, amountInEth).encodeABI()
      }
  }

  let txHash = await new Promise(r=> {
    buildTransferTask(rawTransaction, to, amount, r)
  })

  if(msg.IsMessage(txHash)) {
    return txHash
  }

  return promiseRet.Success(txHash)
}

module.exports = {
  TransferToken
}

