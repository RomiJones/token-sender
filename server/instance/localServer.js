#!/usr/bin/env node

/**
 * Module dependencies.
 */
let handlers = require('../../common/serverHandlers')
let app = require('../../apps/localApp')
let http = require('http')
let port = '6666'

function Start() {
  app.set('port', port)
  let server = http.createServer(app)

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port, '0.0.0.0');
  handlers.Register(server, port);
  console.log(`server http://0.0.0.0:${port} is up`);
}

module.exports = {
  Start
}