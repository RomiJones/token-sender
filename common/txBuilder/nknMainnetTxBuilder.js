const decimal = require('decimal.js')
const promiseRet = require('../../common/promiseRet')
const msg = require('../../common/message')

let instanceNKNWallet = require('./nknWallet').instanceNKNWallet;
let txSender = require('../txSender/txSender');

const txFee = 0.000001;


let currentNonceNKN = null;
instanceNKNWallet.getNonce().then(function(data) {
//    currentNonceNKN = data;
    console.log('start nonce: currentNonceNKN = ', data)
}).catch(function(){
    currentNonceNKN = null;
});

async function buildNKNMainnetTx(tokenSymbol, to, amount) {
    let inputInfo = `[buildNKNMainnetTx (tokenSymbol=${tokenSymbol}, to=${to}, amount=${amount})]`;
    if(currentNonceNKN == null) {
        try {
            currentNonceNKN = await instanceNKNWallet.getNonce();
        } catch(e) {
            currentNonceNKN = null;
            return promiseRet.Error(msg.codes.CAN_NOT_MAKE_NONCE, `nkn transfer failed`, e);
        }
    }

    let txnSigned = null;
    try {
        console.log(Date.now(), ': set this nkn tx nonce = ', currentNonceNKN);
        txnSigned = await instanceNKNWallet.transferTo(to, amount, {nonce:currentNonceNKN, fee:txFee, buildOnly:true});
        let txHash = txnSigned.hash;

        txSender.pushSendingTask({
            senderType:"nkn",
            tokenSymbol:tokenSymbol,
            from:instanceNKNWallet.address,
            to: to,
            amount: amount,
            txHash: txHash,
            rawTransaction: txnSigned
        });
        currentNonceNKN = currentNonceNKN + 1;
        return promiseRet.Success(txHash);
    } catch (ex) {
        console.log(ex);
        return promiseRet.Error(msg.codes.CREATE_FAILED, `some exception occured ${inputInfo}`, ex);
    }
}

module.exports = {
    buildNKNMainnetTx
}

