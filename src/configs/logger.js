import { addColors, createLogger, format, transports } from 'winston';

addColors({ error: 'red', warn: 'yellow', info: 'green', http: 'cyan', debug: 'magenta' });

const isProduction = process.env.NODE_ENV === 'production';

const devFormat = format.combine(
    format.colorize({ all: true }),
    format.timestamp({ format: 'HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`),
);

const prodFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
);

export const logger = createLogger({
    levels: { error: 0, warn: 1, info: 2, http: 3, debug: 4 },
    level: process.env.LOG_LEVEL || (isProduction ? 'http' : 'debug'),
    format: isProduction ? prodFormat : devFormat,
    transports: [new transports.Console()],
});

export function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
}
