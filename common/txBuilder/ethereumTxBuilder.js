const decimal = require('decimal.js')
const promiseRet = require('../../common/promiseRet')
const msg = require('../../common/message')

const contractConfig = require('../../config/ETH/contractConfig')
const accountConfig = require('../../config/ETH/accountInfo')
const supportedTokensERC20 = require('../../config/ETH/supportedTokens')

const web3Instance = require('./web3').web3Instance
const account = require('./web3').account

let txSender = require('../txSender/txSender');

const abi = contractConfig.erc20ABI;
const walletAddress = accountConfig.accountAddress;

async function buildEthereumTx(tokenSymbol, to, amount) {
  let inputInfo = `[buildEthereumTx (tokenSymbol=${tokenSymbol}, to=${to}, amount=${amount})]`;
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
  } else { //erc20
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
      buildSignedTx(tokenSymbol, rawTransaction, to, amount, r)
  })

  if(msg.IsMessage(txHash)) {
    return txHash
  }

  return promiseRet.Success(txHash)
}

let currentNonceETH = null;
web3Instance.eth.getTransactionCount(accountConfig.accountAddress, 'pending')
    .then(count=>{
        currentNonceETH = count
        console.log('start nonce: currentNonceETH = ', count)
    })
    .catch(_=>{
        currentNonceETH = null
    })

let txBuilding = false;
async function buildSignedTx(tokenSymbol, rawTransaction, to, amount, resolve) {
    if(txBuilding) {
        setTimeout(_=> {
            buildSignedTx(tokenSymbol, rawTransaction, to, amount, resolve)
        }, 300 + Math.floor(100 * Math.random()));
        return;
    }
    txBuilding = true

    if(null === currentNonceETH) {
        try {
            currentNonceETH = await web3Instance.eth.getTransactionCount(accountConfig.accountAddress, 'pending');
        } catch(e) {
            currentNonceETH = null;
            resolve(promiseRet.Error(msg.codes.CAN_NOT_MAKE_NONCE, `erc 20 transfer failed`, e));
            txBuilding = false;
            return;
        };
    }

    console.log(Date.now(), ': set this ethereum tx nonce = ', currentNonceETH);
    rawTransaction.nonce = currentNonceETH;
    let signedTx = await account.signTransaction(rawTransaction)
        .catch(e=>{
            console.log(`erc 20 transfer sign failed err: `, e)
            return promiseRet.Error(
                msg.codes.ERC20_TRANSFER_FAILED,
                `erc 20 transfer failed`,
                e
            )
        })

    if(msg.IsMessage(signedTx)) {
        txBuilding = false
        return signedTx
    }
    let txHash = web3Instance.utils.sha3(signedTx.rawTransaction)

    currentNonceETH += 1;
    txSender.pushSendingTask({
        senderType:"eth",
        tokenSymbol:tokenSymbol,
        from: accountConfig.accountAddress,
        to: to,
        amount: amount,
        txHash: txHash,
        rawTransaction: signedTx.rawTransaction
    })

    resolve(txHash)
    txBuilding = false
}

module.exports = {
    buildEthereumTx
}

