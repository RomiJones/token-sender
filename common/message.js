let CommonMessage = function (code, msg) {
  this.code = code
  this.msg = msg

  this.error = function () {
    console.error(this.code, " : ", this.msg)
  }

  this.log = function () {
    console.log(this.code, " : ", this.msg)
  }

  this.clone = function () {
    return new CommonMessage(this.code, this.msg)
  }

  this.toPlainObject = function () {
    return {
      Code: this.code,
      Message: this.msg
    }
  }
}

function makeValidCode(c) {
  return Object.values(codes).includes(c) ? c : codes.UNKNOWN
}

function Create(code, msg) {
  code = makeValidCode(code)
  return new CommonMessage(code, msg)
}

function IsMessage(msg) {
  return msg instanceof CommonMessage
}

function IsSuccess(msg) {
  if(!IsMessage(msg)) {
    return false
  }

  return codes.SUCCESS === msg.code
}

const codes = {
  SUCCESS:0,
  UNKNOWN:1,
  INVALID_PARAM:2,
  LOCAL_NETWORK_ERR:3,
  CREATE_FAILED:4,
  INVALID_VALUE:5,
  CAN_NOT_MAKE_NONCE:6,
  ERC20_TRANSFER_FAILED:7,
  TOKEN_SYMBOL_NOT_SUPPORTED:8,
  ACCESS_KEY_INVALID:9
}

module.exports = {
  codes,
  Create,
  IsMessage,
  IsSuccess,
}
