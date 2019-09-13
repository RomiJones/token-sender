const web3Instance = require('../common/web3/web3').web3Instance
const account = require('../common/web3/web3').account
const msg = require('../common/message')
const promiseRet = require('../common/promiseRet')
const dbServer = require('../api/dbInterface')
const accountConfig = require('../config/accountInfo')

let currentNonce = 0
web3Instance.eth.getTransactionCount(accountConfig.accountAddress, 'pending')
  .then(count=>{
    currentNonce = count
    console.log('start nonce: currentNonce = ', count)
  })
  .catch(_=>{
    currentNonce = null
  })

let transferTasks = []

let sending = false
setInterval(async _=> {
    if(sending) {
        return
    }
    sending = true

    let transfer = transferTasks.shift();
    if(!transfer) {
        sending = false
        return
    }

    console.log('start transfer: ', transfer.txHash)
    console.log('remain transfer count: ', transferTasks.length)

    web3Instance.eth.sendSignedTransaction(transfer.rawTransaction)
        .on('error', async err => {
            console.log('erc 20 transfer failed: ', err, ' ', transfer.txHash)

            let time = Date.now() / 1000
            let notifyErrInfo = {
                "timestamp": Math.floor(time),
                "txType": "eth",
                "addressFrom": accountConfig.accountAddress,
                "addressTo": transfer.to,
                "value": parseFloat(transfer.amount),
                "txId": transfer.txHash
            }

            console.log("notify tx error ", notifyErrInfo)
            let notifyRet = await dbServer.ErrorNotify(notifyErrInfo)
            console.log("notify tx error ret " + `${notifyRet}`)
            console.log("----------transfer over----------")
        }).then(async _=> {
            console.log(`send erc 20 transfer success ${transfer.txHash}`)

            let time = Date.now() / 1000
            let notifySuccessInfo = {
                addressFrom: accountConfig.accountAddress,
                addressTo: transfer.to,
                value:  parseFloat(transfer.amount),
                txId: transfer.txHash,
                blockTimestamp:  Math.floor(time),
            }
            console.log("notify tx success ", notifySuccessInfo)
            let notifyRet = await dbServer.TransferNotify(notifySuccessInfo)
            console.log("notify tx success ret " + `${notifyRet}`)
            console.log("----------transfer over----------")
        }).catch(err => {
            console.log('throw err ', err, ' ', transfer.txHash)
        })
    sending = false
}, 500);

function pushTransferTask(transfer) {
  transferTasks.push(transfer)
}

let txBuilding = false
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
  buildTransferTask
}