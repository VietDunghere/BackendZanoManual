import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../../configs/env.js';

export function createAccessToken(user) {
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

export function createRefreshToken(user) {
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

export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
