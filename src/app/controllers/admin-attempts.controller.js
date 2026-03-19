import { AppError } from '../../utils/classes/app-error.js';
import { logger } from '../../configs/logger.js';
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

export class AdminAttemptsController {
    constructor(adminAttemptsService) {
        this.adminAttemptsService = adminAttemptsService;
    }

    async getAttemptDetail(req, res) {
        const attemptId = parsePositiveInteger(req.params.attemptId, 'attemptId');
        logger.info('Admin viewed attempt detail', {
            traceId: req.traceId || null,
            adminUserId: req.auth ? req.auth.userId : null,
            attemptId,
        });
        const result = await this.adminAttemptsService.getAttemptDetail(attemptId);
        return sendSuccess(res, req, 200, result);
    }
}
