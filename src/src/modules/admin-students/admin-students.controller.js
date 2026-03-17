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

class AdminStudentsController {
    constructor(adminStudentsService) {
        this.adminStudentsService = adminStudentsService;
    }

    async listStudents(req, res) {
        const result = await this.adminStudentsService.listStudents(req.query || {});
        return sendSuccess(res, req, 200, result.data, { pagination: result.pagination });
    }

    async createStudent(req, res) {
        const result = await this.adminStudentsService.createStudent(req.body || {});
        return sendSuccess(res, req, 201, result);
    }

    async updateStudent(req, res) {
        const studentId = parsePositiveInteger(req.params.studentId, 'studentId');
        const result = await this.adminStudentsService.updateStudent(studentId, req.body || {});
        return sendSuccess(res, req, 200, result);
    }

    async deleteStudent(req, res) {
        const studentId = parsePositiveInteger(req.params.studentId, 'studentId');
        const result = await this.adminStudentsService.deleteStudent(studentId);
        return sendSuccess(res, req, 200, result);
    }

    async getOverview(req, res) {
        const studentId = parsePositiveInteger(req.params.studentId, 'studentId');
        const result = await this.adminStudentsService.getOverview(studentId);
        return sendSuccess(res, req, 200, result);
    }

    async listResults(req, res) {
        const studentId = parsePositiveInteger(req.params.studentId, 'studentId');
        const result = await this.adminStudentsService.listStudentResults(studentId, req.query || {});
        return sendSuccess(res, req, 200, result.data, { pagination: result.pagination });
    }

    async getReport(req, res) {
        const studentId = parsePositiveInteger(req.params.studentId, 'studentId');
        const result = await this.adminStudentsService.getStudentReport(studentId, req.query.format);
        return sendSuccess(res, req, 200, result);
    }
}

module.exports = { AdminStudentsController };
