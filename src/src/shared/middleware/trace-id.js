const { randomUUID } = require('crypto');

function traceIdMiddleware(req, _res, next) {
  req.traceId = randomUUID();
  next();
}

module.exports = { traceIdMiddleware };
