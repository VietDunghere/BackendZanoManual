import { logger } from '../configs/logger.js';

export function errorHandler(error, _req, res, _next) {
    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_SERVER_ERROR';

    if (statusCode >= 500) {
        logger.error(error.message || 'Internal server error', {
            code,
            status: statusCode,
            stack: error.stack,
        });
    } else {
        logger.warn(error.message || 'Request failed', {
            code,
            status: statusCode,
        });
    }

    res.status(statusCode).json({
        error: {
            code,
            message: error.message || 'Internal server error',
            details: error.details || null,
        },
    });
}
