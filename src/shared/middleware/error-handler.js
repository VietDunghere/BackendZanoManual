const { logger } = require('../logger/logger');

const ERROR_ALREADY_LOGGED = Symbol.for('backendzano.error.logged');

function logErrorOnce(error, statusCode, traceId, code) {
    if (error[ERROR_ALREADY_LOGGED]) {
        return;
    }

    error[ERROR_ALREADY_LOGGED] = true;

    const metadata = {
        traceId,
        code,
        status: statusCode,
        details: error.details || null,
    };

    if (statusCode >= 500) {
        logger.error(error.message || 'Internal server error', {
            ...metadata,
            stack: error.stack,
        });
        return;
    }

    logger.warn(error.message || 'Request failed', metadata);
}

function errorHandler(error, _req, res, _next) {
    const statusCode = error.statusCode || 500;
    const traceId = _req.traceId || null;
    const code = error.code || 'INTERNAL_SERVER_ERROR';

    logErrorOnce(error, statusCode, traceId, code);

    res.status(statusCode).json({
        error: {
            code,
            message: error.message || 'Internal server error',
            details: error.details || null,
        },
        meta: {
            traceId,
        },
    });
}

module.exports = { errorHandler };
