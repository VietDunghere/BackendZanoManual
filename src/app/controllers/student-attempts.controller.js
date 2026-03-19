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

function normalizeSelectedOption(body) {
    if (!body || typeof body !== 'object') {
        return '';
    }

    if (typeof body.selectedOptionLabel === 'string' && body.selectedOptionLabel.trim()) {
        return body.selectedOptionLabel.trim();
    }

    if (typeof body.selectedOptionId === 'string' && body.selectedOptionId.trim()) {
        const normalized = body.selectedOptionId.trim().toUpperCase();
        const maybeLabel = normalized.replace(/^O_/, '').replace(/^OPTION_/, '');
        if (['A', 'B', 'C', 'D'].includes(maybeLabel)) {
            return maybeLabel;
        }
    }

    return '';
}

export class StudentAttemptsController {
    constructor(studentAttemptsService) {
        this.studentAttemptsService = studentAttemptsService;
    }

    async getAttemptDetail(req, res) {
        const attemptId = parsePositiveInteger(req.params.attemptId, 'attemptId');
        const result = await this.studentAttemptsService.getAttemptDetail(attemptId, req.auth.userId);
        return sendSuccess(res, req, 200, result);
    }

    async saveAnswer(req, res) {
        const attemptId = parsePositiveInteger(req.params.attemptId, 'attemptId');
        const questionId = parsePositiveInteger(req.params.questionId, 'questionId');
        const normalizedSelectedOption = normalizeSelectedOption(req.body || {});

        if (!normalizedSelectedOption) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'selectedOptionLabel|selectedOptionId', issue: 'required' },
            ]);
        }

        const result = await this.studentAttemptsService.saveAnswer(
            attemptId,
            questionId,
            normalizedSelectedOption,
            req.auth.userId,
        );

        return sendSuccess(res, req, 200, result);
    }

    async submitAttempt(req, res) {
        const attemptId = parsePositiveInteger(req.params.attemptId, 'attemptId');
        const result = await this.studentAttemptsService.submitAttempt(attemptId, req.auth.userId);
        return sendSuccess(res, req, 200, result);
    }
}
