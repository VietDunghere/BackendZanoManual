const morgan = require('morgan');
const { logger } = require('./logger');

morgan.token('traceId', (req) => req.traceId || '-');
morgan.token('path', (req) => req.originalUrl || req.url || '-');

const requestLogger = morgan(
    (tokens, req, res) => {
        const data = {
            method: tokens.method(req, res),
            path: tokens.path(req, res),
            status: Number(tokens.status(req, res) || 0),
            responseTimeMs: Number(tokens['response-time'](req, res) || 0),
            traceId: tokens.traceId(req, res),
        };

        return JSON.stringify(data);
    },
    {
        stream: {
            write: (rawLine) => {
                let data;
                try {
                    data = JSON.parse(rawLine);
                } catch (_error) {
                    logger.http(rawLine.trim());
                    return;
                }

                const message = `${data.method} ${data.path} ${data.status} ${data.responseTimeMs}ms`;
                logger.http(message, data);
            },
        },
    },
);

module.exports = { requestLogger };
