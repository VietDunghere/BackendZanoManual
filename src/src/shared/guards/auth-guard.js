const { AppError } = require('../errors/app-error');
const { verifyAccessToken } = require('../utils/jwt');

function authGuard(req, _res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid Authorization header', 401, 'UNAUTHORIZED'));
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      throw new AppError('Invalid token type', 401, 'UNAUTHORIZED');
    }

    req.auth = {
      userId: Number(payload.sub),
      username: payload.username,
      role: payload.role,
    };

    return next();
  } catch (_error) {
    return next(new AppError('Invalid or expired access token', 401, 'UNAUTHORIZED'));
  }
}

module.exports = { authGuard };
