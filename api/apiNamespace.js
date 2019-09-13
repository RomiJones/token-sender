const API_BASE_URI = '/api/v1'

let tsNamespace = {
  API_BASE_URI: API_BASE_URI,
  DB_API: {
    DO_ERC20_TRANSFER: {uri: `${API_BASE_URI}/erc20-transfer`},
    TX_NOTIFY: {uri: `${API_BASE_URI}/tx-notify`},
  },
}

module.exports = tsNamespace