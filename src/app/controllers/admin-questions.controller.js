import { AppError } from '../../utils/classes/app-error.js';
import { sendSuccess } from '../../utils/helper/response.js';

function parsePositiveInteger(value, fieldName) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
            { field: fieldName, issue: 'invalid_number' },
        ]);
    }
    return parsed;
}

export class AdminQuestionsController {
    constructor(adminQuestionsService) {
        this.adminQuestionsService = adminQuestionsService;
    }

    async importQuestions(req, res) {
        const examId = parsePositiveInteger(req.params.examId, 'examId');
        const result = await this.adminQuestionsService.importQuestions(examId, req.body || {});
        return sendSuccess(res, req, 200, result);
    }

    async listQuestions(req, res) {
        const examId = parsePositiveInteger(req.params.examId, 'examId');
        const result = await this.adminQuestionsService.listQuestions(examId);
        return sendSuccess(res, req, 200, result);
    }

    async createQuestion(req, res) {
        const examId = parsePositiveInteger(req.params.examId, 'examId');
        const result = await this.adminQuestionsService.createQuestion(examId, req.body || {});
        return sendSuccess(res, req, 201, result);
    }

    async updateQuestion(req, res) {
        const examId = parsePositiveInteger(req.params.examId, 'examId');
        const questionId = parsePositiveInteger(req.params.questionId, 'questionId');
        const result = await this.adminQuestionsService.updateQuestion(examId, questionId, req.body || {});
        return sendSuccess(res, req, 200, result);
    }

    async deleteQuestion(req, res) {
        const examId = parsePositiveInteger(req.params.examId, 'examId');
        const questionId = parsePositiveInteger(req.params.questionId, 'questionId');
        const result = await this.adminQuestionsService.deleteQuestion(examId, questionId);
        return sendSuccess(res, req, 200, result);
    }
}
