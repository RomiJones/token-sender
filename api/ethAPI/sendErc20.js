let router = require('express').Router()
let uri = require('../apiNamespace').DB_API.DO_ERC20_TRANSFER.uri
let TransferToken = require('../../common/web3/contract').TransferToken
let msg = require('../../common/message')
let suppotedTokens = require("../../config/supportedTokens");

const { check, validationResult } = require('express-validator/check')
const ACCESS_KEY = '55ef6100e7cac696648a78688f664f014836b03a261873f4ff78701745e6f09a'

async function Action(req, res) {
    console.log('receive a request!')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log({Error: 'invalid param', OrgData: req.body})
        let result = msg.Create(msg.codes.INVALID_PARAM, {Error: 'invalid param', OrgData: req.body})
        res.status(400).json(result.toPlainObject())
        return
    }

    /*
    if(4 !== req.body.params.length) {
    console.log({Error: 'invalid param length', OrgData: req.body})
    let result = msg.Create(msg.codes.INVALID_PARAM, {Error: 'invalid param length', OrgData: req.body})
    res.status(400).json(result.toPlainObject())
    return
    }
    */
    let tokenSymbol = req.body.tokenSymbol;
    let toAddrr = req.body.toAddr;
    let amount = req.body.amount;
    let userKey = req.body.accessKey;

    if(!(tokenSymbol == "ETH" || suppotedTokens.getToken(tokenSymbol))) {
        console.log({Error: 'token symbol not supported', OrgData: req.body})
        let result = msg.Create(msg.codes.TOKEN_SYMBOL_NOT_SUPPORTED, {Error: 'token symbol not supported', OrgData: req.body})
        res.status(400).json(result.toPlainObject())
        return;
    }

    if(userKey !== ACCESS_KEY) {
        let result = msg.Create(msg.codes.ACCESS_KEY_INVALID, {Error: 'access key invalid', OrgData: req.body})
        res.status(400).json(result.toPlainObject());
        return;
    }

    let txRet = await TransferToken(tokenSymbol, toAddrr, amount)
        .catch(err=> {
            //should use try catch
            console.log(`transfer ${amount} ${tokenSymbol} to ${toAddrr} failed: ${err}`)
            return err
        })

    if(msg.IsSuccess(txRet)) {
        res.json({
            result: {
                txId: txRet.msg.Content
            }
        })
    } else {
        res.json({})
    }
}

router.post(`/`, [
    check('tokenSymbol').exists().isString(),
    check('toAddr').exists().isString(),
    //check('amount').exists().isString(),
], Action)

module.exports = {
  router,
  uri,
}