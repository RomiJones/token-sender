let debug = require('debug')('token-swap-server:server');

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error, port) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(server) {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

function Register(server, port) {
  server.on('error', (err)=>onError(err, port))
  server.on('listening', _=>onListening(server))
}

module.exports = {
  Register
}