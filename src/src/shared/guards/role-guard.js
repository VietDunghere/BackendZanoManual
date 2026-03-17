const { AppError } = require('../errors/app-error');

function roleGuard(allowedRoles = []) {
  const normalizedAllowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return function roleGuardMiddleware(req, _res, next) {
    if (!req.auth) {
      return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }

    if (!normalizedAllowed.includes(req.auth.role)) {
      return next(new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN'));
    }

    return next();
  };
}

module.exports = { roleGuard };
