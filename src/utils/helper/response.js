export function sendSuccess(res, _req, statusCode, data, extra = {}) {
    const payload = { data };

    if (extra.pagination) {
        payload.pagination = extra.pagination;
    }

    return res.status(statusCode).json(payload);
}
