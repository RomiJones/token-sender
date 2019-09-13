const decimal = require('decimal.js')
const promiseRet = require('../../common/promiseRet')
const msg = require('../../common/message')

let instanceNKNWallet = require('./nknWallet').instanceNKNWallet;
let txSender = require('../txSender/txSender');

const txFee = 0.0;
async function buildNKNMainnetTx(tokenSymbol, to, amount) {
    let inputInfo = `[buildNKNMainnetTx (tokenSymbol=${tokenSymbol}, to=${to}, amount=${amount})]`;
    let txnSigned = null;
    try {
        txnSigned = await instanceNKNWallet.transferTo(to, amount, {fee:txFee, buildOnly:true});
        let txHash = txnSigned.hash;

        txSender.pushSendingTask({
            senderType:"NKN",
            from:instanceNKNWallet.address,
            to: to,
            amount: amount,
            txHash: txHash,
            rawTransaction: txnSigned
        })

        return promiseRet.Success(txHash);
    } catch (ex) {
        console.log(ex);
        return promiseRet.Error(msg.codes.CREATE_FAILED, `some exception occured ${inputInfo}`, ex);
    }
}

module.exports = {
    buildNKNMainnetTx
}

