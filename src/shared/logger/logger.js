const { createLogger, format, transports } = require('winston');
const { customLevels, normalizeLogInfo, developmentFormat, productionFormat } = require('./format');

const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
    levels: customLevels.levels,
    level: process.env.LOG_LEVEL || (isProduction ? 'http' : 'debug'),
    defaultMeta: {
        service: 'backendzano',
    },
    format: isProduction
        ? format.combine(
              format.timestamp(),
              format.errors({ stack: true }),
              format.splat(),
              normalizeLogInfo(),
              productionFormat,
          )
        : format.combine(
              format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              format.errors({ stack: true }),
              format.splat(),
              normalizeLogInfo(),
              developmentFormat,
          ),
    transports: [new transports.Console()],
});

module.exports = {
    logger,
    isProduction,
};
