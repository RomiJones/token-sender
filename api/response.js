function Response(res, result) {
  let internalErr = false
  let retObj = {}
  try {
    retObj = result.toPlainObject()
    res.json(retObj)
  } catch (e) {
    internalErr = true
  }

  if(internalErr) {
    console.log(result)
    res.status = 500
    res.json({Error: "Internal error"})
  }
}

module.exports = {
  Response
}