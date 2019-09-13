let router = require('express').Router()
let uri = require('../apiNamespace').DB_API.TX_NOTIFY.uri
let dbServer = require('../dbInterface')
const { check, validationResult } = require('express-validator/check');

const toAddress = 'AeazBYxUcHxxcsoqDB546pqi4HunkxCvkC'

const paramNames = {
  addressFrom: 'addressFrom',
  addressTo: 'addressTo',
  value: 'value',
  txId: 'txId',
  blockTimestamp: 'blockTimestamp',
}

async function Action(req, res) {
  console.log(req.body)

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('invalid param')
    res.json({Code: 0, Data: null, Error:""})
    return
  }

  if(toAddress !== req.body.addressTo) {
    console.log('invalid neo receiver address')
    res.json({Code: 0, Data: null, Error:""})
    return
  }

  let notifyResult = await dbServer.TransferNotify(req.body)
  res.json(notifyResult.msg.Content)
}

router.post(`/`, [
  check(Object.values(paramNames)).exists(),
], Action)

module.exports = {
  router,
  uri,
}