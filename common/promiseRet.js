let msg = require('./message')

function Error(code, desc, err) {
  return new Promise(r=>{
    r(msg.Create(code, {Description: desc, Content: err}))
  })
}

function Success(data) {
  return new Promise(r=>{
    r(msg.Create(msg.codes.SUCCESS, {Description:"Success", Content: data}))
  })
}

module.exports = {
  Error,
  Success,
}