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

class AdminExamsController {
    constructor(adminExamsService) {
        this.adminExamsService = adminExamsService;
    }

    async listExams(req, res) {
        const result = await this.adminExamsService.listExams(req.query || {});
        return sendSuccess(res, req, 200, result.data, { pagination: result.pagination });
    }

    async createExam(req, res) {
        const result = await this.adminExamsService.createExam(req.body || {}, req.auth.userId);
        return sendSuccess(res, req, 201, result);
    }

    async getExamDetail(req, res) {
        const examId = parsePositiveInteger(req.params.examId, 'examId');
        const result = await this.adminExamsService.getExamDetail(examId);
        return sendSuccess(res, req, 200, result);
    }

    async updateExam(req, res) {
        const examId = parsePositiveInteger(req.params.examId, 'examId');
        const result = await this.adminExamsService.updateExam(examId, req.body || {});
        return sendSuccess(res, req, 200, result);
    }

    async deleteExam(req, res) {
        const examId = parsePositiveInteger(req.params.examId, 'examId');
        const result = await this.adminExamsService.deleteExam(examId);
        return sendSuccess(res, req, 200, result);
    }

    async publishExam(req, res) {
        const examId = parsePositiveInteger(req.params.examId, 'examId');
        const result = await this.adminExamsService.publishExam(examId);
        return sendSuccess(res, req, 200, result);
    }
}

module.exports = { AdminExamsController };
