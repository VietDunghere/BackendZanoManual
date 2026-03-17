const { AppError } = require('../errors/app-error');

function createRateLimiter(options = {}) {
    const windowMs = Number(options.windowMs || 60_000);
    const max = Number(options.max || 20);
    const keyFn = typeof options.keyFn === 'function' ? options.keyFn : defaultKeyFn;
    const errorMessage = options.errorMessage || 'Too many requests, please try again later';

    const buckets = new Map();

    return function rateLimitMiddleware(req, _res, next) {
        const key = keyFn(req);
        const now = Date.now();

        const bucket = buckets.get(key);
        if (!bucket || now > bucket.resetAt) {
            buckets.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }

        if (bucket.count >= max) {
            return next(new AppError(errorMessage, 429, 'RATE_LIMIT_EXCEEDED'));
        }

        bucket.count += 1;
        return next();
    };
}

function defaultKeyFn(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
    return `${req.method}:${req.baseUrl}:${req.path}:${ip}`;
}

module.exports = { createRateLimiter };
