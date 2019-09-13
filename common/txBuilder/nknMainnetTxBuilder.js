const decimal = require('decimal.js')

const promiseRet = require('../../common/promiseRet')
const msg = require('../../common/message')
const dbServer = require('../../api/dbInterface')

let pushTransferTask = require('../../tasks/transferTasks').pushTransferTask;

module.exports = {
    buildNKNMainnetTx
}

