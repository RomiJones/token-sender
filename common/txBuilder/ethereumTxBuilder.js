const decimal = require('decimal.js')
const contractConfig = require('../../config/ETH/contractConfig')
const accountConfig = require('../../config/ETH/accountInfo')
const supportedTokensERC20 = require('../../config/ETH/supportedTokens')
const promiseRet = require('../../common/promiseRet')
const msg = require('../../common/message')
const dbServer = require('../../api/dbInterface')
const web3Instance = require('./web3').web3Instance
const account = require('./web3').account

let pushTransferTask = require('../../tasks/transferTasks').pushTransferTask;

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
    buildTransferTask(rawTransaction, to, amount, r)
  })

  if(msg.IsMessage(txHash)) {
    return txHash
  }

  return promiseRet.Success(txHash)
}

let currentNonce = 0
web3Instance.eth.getTransactionCount(accountConfig.accountAddress, 'pending')
    .then(count=>{
        currentNonce = count
        console.log('start nonce: currentNonce = ', count)
    })
    .catch(_=>{
        currentNonce = null
    })

let txBuilding = false;
async function buildTransferTask(rawTransaction, to, amount, resolve) {
    if(txBuilding) {
        setTimeout(_=> {
            buildTransferTask(rawTransaction, to, amount, resolve)
        }, 300 + Math.floor(100 * Math.random()));
        return;
    }
    txBuilding = true

    if(null === currentNonce) {
        web3Instance.eth.getTransactionCount(accountConfig.accountAddress, 'pending')
            .then(count=>{
                currentNonce = count
            })
            .catch(e =>{
                currentNonce = null;
                resolve(promiseRet.Error(msg.codes.CAN_NOT_MAKE_NONCE, `erc 20 transfer failed`, e));
                txBuilding = false;
                return;
            });
    }

    rawTransaction.nonce = currentNonce

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

    console.log(Date.now(), ': current nonce = ', currentNonce)
    currentNonce += 1
    pushTransferTask({
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

