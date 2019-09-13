const web3Instance = require('../common/txBuilder/web3').web3Instance
const account = require('../common/txBuilder/web3').account
const msg = require('../common/message')
const promiseRet = require('../common/promiseRet')
const dbServer = require('../api/dbInterface')
const accountConfig = require('../config/ETH/accountInfo')

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

module.exports = {
//  buildTransferTask,
  pushTransferTask
}
