const decimal = require('decimal.js')
const promiseRet = require('../../common/promiseRet')
const msg = require('../../common/message')

let instanceWalletNKN = require('./nknWallet').instanceWalletNKN;

let pushTransferTask = require('../../tasks/transferTasks').pushTransferTask;

const txFee = 0.1;
async function buildNKNMainnetTx(tokenSymbol, to, amount) {
    let inputInfo = `[buildNKNMainnetTx (tokenSymbol=${tokenSymbol}, to=${to}, amount=${amount})]`;
    let txnSigned = null;
    try {
        txnSigned = await instanceWalletNKN.transferTo(to, amount, {fee:txFee, buildOnly:true});
        return promiseRet.Success(txnSigned.hash);
    } catch (ex) {
        console.log(ex);
        return promiseRet.Error(msg.codes.CREATE_FAILED, `some exception occured ${inputInfo}`, ex);
    }
}

module.exports = {
    buildNKNMainnetTx
}
