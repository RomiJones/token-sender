let axios = require('axios')
let decimal = require('decimal.js')
let promiseRet = require('../common/promiseRet')
let msgCodes = require('../common/message').codes

let serverUrl = null;
if(process.env.NODE_ENV === "production") {
    serverUrl = 'http://10.138.0.5:6443';
} else if(process.env.NODE_ENV === "development"){
    serverUrl = 'http://10.146.0.3:15230';
} else {
    serverUrl = 'http://10.146.0.3:15230';
}

decimal.set({ precision: 9 });
async function axiosGet(uri) {
  let ret =  await axios.get(`${serverUrl}/${uri}`)
    .catch(err => {
      return {
        NetworkErr: true,
        Error: err.response.data
      }
    })

  if(ret.NetworkErr) {
    ret = {Code: null, Error: ret.Error}
  } else {
    ret = ret.data
  }
  return ret
}

async function axiosPost(uri, param = null, header = null) {
    header =  header || {} ;
    let ret =  await axios.post(`${serverUrl}/${uri}`, param, {
        headers: header
    }).catch(err => {
        console.log(Date.now() + " network error: ", err)
        return {
          NetworkErr: true,
          Error: ""
        }
    })

    //console.log(`axiosPost ret ${ret}`);

    if(ret.NetworkErr) {
      ret = {Code: 2, Data: null, Error: ret.Error}
    } else {
      ret = ret.data
    }

    return ret
}

function buildApiResult(response, apiName, networkErrInfo) {
  if(null === response.Code) {
    return promiseRet.Error(msgCodes.LOCAL_NETWORK_ERR,
      `call local api [${networkErrInfo}] failed`,
      response.Error
    )
  } else {

    if(0 === response.Code) {
      return promiseRet.Success(response)
    } else {
      return promiseRet.Error(msgCodes.LOCAL_NETWORK_ERR,
        `api [${apiName}] failed.`,
        response)
    }
  }
}

async function TransferNotify(notifyInfo) {
  let notifyResult = await axiosPost(`monitor/transactions`, notifyInfo, {"nkn-swap": "asdf"})

  console.log("notify result:")
  console.log(notifyResult)
  console.log('--------------------------')
  return buildApiResult(notifyResult, 'transaction notify', `TransferNotify(notifyInfo=${notifyInfo})`)
}

async function ErrorNotify(notifyInfo) {
  let notifyResult = await axiosPost(`monitor/transactions_fail`, notifyInfo, {"nkn-swap": "asdf"})

  return buildApiResult(notifyResult, 'error notify', `ErrorNotify(notifyInfo=${notifyInfo})`)
}

module.exports = {
  TransferNotify,
  ErrorNotify,
}