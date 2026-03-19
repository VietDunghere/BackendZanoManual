import { AppError } from '../utils/classes/app-error.js';

export function notFoundHandler(req, _res, next) {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}
