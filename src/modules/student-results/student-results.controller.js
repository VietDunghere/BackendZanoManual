const { AppError } = require('../../shared/errors/app-error');
const { sendSuccess } = require('../../shared/utils/response');

function parsePositiveInteger(value, fieldName) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
            { field: fieldName, issue: 'invalid_number' },
        ]);
    }

    return parsed;
}

class StudentResultsController {
    constructor(studentResultsService) {
        this.studentResultsService = studentResultsService;
    }

    async getResultDetail(req, res) {
        const resultId = parsePositiveInteger(req.params.resultId, 'resultId');
        const result = await this.studentResultsService.getResultDetail(resultId, req.auth.userId);
        return sendSuccess(res, req, 200, result);
    }

    async listResults(req, res) {
        const query = req.query || {};
        if (query.examId !== undefined && query.examId !== null && String(query.examId).trim() !== '') {
            parsePositiveInteger(query.examId, 'examId');
        }

        const result = await this.studentResultsService.listResults(query, req.auth.userId);
        return sendSuccess(res, req, 200, result.data, { pagination: result.pagination });
    }
}

module.exports = { StudentResultsController };
