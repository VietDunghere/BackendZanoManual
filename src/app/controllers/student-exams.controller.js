import { AppError } from '../../utils/classes/app-error.js';
import { sendSuccess } from '../../utils/helper/response.js';

export class StudentExamsController {
    constructor(studentExamsService) {
        this.studentExamsService = studentExamsService;
    }

    async listExams(req, res) {
        const result = await this.studentExamsService.listExams(req.query || {});
        return sendSuccess(res, req, 200, result.data, { pagination: result.pagination });
    }

    async getExamDetail(req, res) {
        const examId = Number(req.params.examId);
        if (!Number.isInteger(examId) || examId <= 0) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'examId', issue: 'invalid_number' },
            ]);
        }

        const result = await this.studentExamsService.getExamDetail(examId);
        return sendSuccess(res, req, 200, result);
    }

    async startAttempt(req, res) {
        const examId = Number(req.params.examId);
        if (!Number.isInteger(examId) || examId <= 0) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'examId', issue: 'invalid_number' },
            ]);
        }

        const result = await this.studentExamsService.startAttempt(examId, req.auth.userId);
        return sendSuccess(res, req, 201, result);
    }
}
