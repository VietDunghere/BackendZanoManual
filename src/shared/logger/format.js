const { format, addColors } = require('winston');

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'cyan',
        debug: 'magenta',
    },
};

addColors(customLevels.colors);

const ansi = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

const levelAnsiColor = {
    ERROR: ansi.red,
    WARN: ansi.yellow,
    INFO: ansi.green,
    HTTP: ansi.cyan,
    DEBUG: ansi.magenta,
};

const hiddenKeys = new Set(['level', 'timestamp', 'message', 'service', 'traceId', 'stack']);

function serializeValue(value) {
    if (value === null || value === undefined) {
        return String(value);
    }

    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    return JSON.stringify(value);
}

function collectContext(metadata) {
    return Object.entries(metadata)
        .filter(([key, value]) => !hiddenKeys.has(key) && value !== undefined)
        .map(([key, value]) => `${key}=${serializeValue(value)}`)
        .join(' ');
}

const normalizeLogInfo = format((info) => {
    if (typeof info.message !== 'string') {
        info.message = serializeValue(info.message);
    }

    if (info.responseTimeMs !== undefined) {
        const value = Number(info.responseTimeMs);
        if (!Number.isNaN(value)) {
            info.responseTimeMs = value;
        }
    }

    return info;
});

const developmentFormat = format.printf((info) => {
    const timestamp = info.timestamp;
    const level = String(info.level || 'info').toUpperCase();
    const service = info.service || 'app';
    const traceId = info.traceId || '-';
    const color = levelAnsiColor[level] || '';
    const coloredLevel = color ? `${color}${level}${ansi.reset}` : level;
    const context = collectContext(info);

    const head = `${timestamp} ${coloredLevel} ${service} traceId=${traceId} ${info.message}`;
    const line = context ? `${head} ${context}` : head;

    if (!info.stack) {
        return line;
    }

    return `${line}\nStack:\n${info.stack}`;
});

function buildProductionPayload(info) {
    const payload = {
        timestamp: info.timestamp,
        level: info.level,
        service: info.service,
        message: info.message,
    };

    if (info.traceId) {
        payload.traceId = info.traceId;
    }

    if (info.method) {
        payload.method = info.method;
    }

    if (info.path) {
        payload.path = info.path;
    }

    if (info.status !== undefined) {
        payload.status = info.status;
    }

    if (info.responseTimeMs !== undefined) {
        payload.responseTimeMs = info.responseTimeMs;
    }

    if (info.code) {
        payload.code = info.code;
    }

    if (info.details !== undefined && info.details !== null) {
        payload.details = info.details;
    }

    if (info.stack) {
        payload.stack = info.stack;
    }

    for (const [key, value] of Object.entries(info)) {
        if (hiddenKeys.has(key) || payload[key] !== undefined || value === undefined) {
            continue;
        }
        payload[key] = value;
    }

    return payload;
}

const productionFormat = format.printf((info) => JSON.stringify(buildProductionPayload(info)));

module.exports = {
    customLevels,
    normalizeLogInfo,
    developmentFormat,
    productionFormat,
};
