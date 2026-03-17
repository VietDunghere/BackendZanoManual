const { AppError } = require('../errors/app-error');

function notFoundHandler(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

module.exports = { notFoundHandler };
