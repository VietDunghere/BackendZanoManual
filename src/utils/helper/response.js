function buildMeta(req, extraMeta = null) {
    const base = {
        traceId: req.traceId || null,
    };

    return extraMeta ? { ...base, ...extraMeta } : base;
}

export function sendSuccess(res, req, statusCode, data, extra = {}) {
    const payload = {
        data,
        meta: buildMeta(req, extra.meta || null),
    };

    if (extra.pagination) {
        payload.pagination = extra.pagination;
    }

    return res.status(statusCode).json(payload);
}
