const web3Instance = require('../txBuilder/web3').web3Instance;
const dbServer = require('../../api/dbInterface');
const accountConfig = require('../../config/ETH/accountInfo');

let instanceNKNWallet = require('../txBuilder/nknWallet').instanceNKNWallet;

let allTasks = [];
let isSending = false;

setInterval(async function() {
    if(isSending) {
        return;
    }
    isSending = true;

    let task = allTasks.shift();
    if(!task) {
        isSending = false;
        return;
    }

    console.log(`start transfer [type : ${task.senderType}]: ${task.txHash}`);
    if(task.senderType == "eth") {
        web3Instance.eth.sendSignedTransaction(transfer.rawTransaction)
            .on('error', async err => {
                await notifyFailed(task);
                console.log("----------send etheruem token over----------")
            }).then(async function() {
                await notifySuccess(task);
                console.log("----------send etheruem token over----------")
            }).catch(function(err) {
                console.log('throw err ', err, ' ', task.txHash)
            })
    } else if(task.senderType == "nkn") {
        let txSignedNKN = task.rawTransaction;
        let ok = false;
        try {
            let res = await instanceNKNWallet.sendTransaction(txSignedNKN);
//            console.log(res);
            ok = true;
        } catch(ex) {
            console.log('throw exception ', ex, ' ', task.txHash)
        }

        if(!ok) {
            await notifyFailed(task);
        } else {
            await notifySuccess(task);
        }
        console.log("----------send nkn mainnet token over----------")
    } else {
        console.log("------------------unkown sender type-------------------");
    }
    console.log('remain transfer count: ', allTasks.length);
    isSending = false
}, 500);

async function notifySuccess(taskInfo) {
    let time = Date.now() / 1000;
    let notifySuccessInfo = {
        "blockTimestamp":  Math.floor(time),
        "txType": taskInfo.senderType,
        "addressFrom": taskInfo.from,
        "addressTo": taskInfo.to,
        "value":  parseFloat(taskInfo.amount),
        "txId": taskInfo.txHash
    }
    console.log("notify tx success ", notifySuccessInfo)
    let notifyRet = await dbServer.TransferNotify(notifySuccessInfo)
    console.log("notify tx success ret " + `${notifyRet}`)
}

async function notifyFailed(taskInfo) {
    let time = Date.now() / 1000;
    let notifyErrInfo = {
        "timestamp": Math.floor(time),
        "txType": taskInfo.senderType,
        "addressFrom": taskInfo.from,
        "addressTo": taskInfo.to,
        "value": parseFloat(taskInfo.amount),
        "txId": taskInfo.txHash
    }
    console.log("notify tx error ", notifyErrInfo)
    let notifyRet = await dbServer.ErrorNotify(notifyErrInfo)
    console.log("notify tx error ret " + `${notifyRet}`)
}

function pushSendingTask(transfer) {
    allTasks.push(transfer)
}

module.exports = {
  pushSendingTask
}
