import { randomUUID } from 'crypto';

export function traceIdMiddleware(req, _res, next) {
    req.traceId = randomUUID();
    next();
}
