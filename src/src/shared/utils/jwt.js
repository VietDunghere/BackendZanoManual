const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const { env } = require('../../config/env');

function createAccessToken(user) {
  const payload = {
    sub: String(user.id),
    username: user.username,
    role: user.role,
    type: 'access',
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });
}

function createRefreshToken(user) {
  const payload = {
    sub: String(user.id),
    username: user.username,
    role: user.role,
    type: 'refresh',
    tokenId: randomUUID(),
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
