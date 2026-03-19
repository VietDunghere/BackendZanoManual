import { pool } from '../../configs/database.js';
import { AppError } from '../../utils/classes/app-error.js';
import { AdminExamsRepository } from '../repositories/admin-exams.repository.js';

function normalizePagination(query) {
    const rawPage = Number(query.page || 1);
    const rawPageSize = Number(query.pageSize || 10);
    const maxPage = 10_000;

    const pageBase = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const page = Math.min(pageBase, maxPage);
    const pageSizeBase = Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;
    const pageSize = Math.min(pageSizeBase, 50);

    return { page, pageSize };
}

function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function validateExamPayload(payload) {
    const details = [];
    const title = normalizeText(payload.title);
    const description = normalizeText(payload.description) || null;
    const type = normalizeText(payload.type);
    const semester = normalizeText(payload.semester);
    const durationMinutes = Number(payload.durationMinutes);
    const status = normalizeText(payload.status) || 'draft';

    if (!title) {
        details.push({ field: 'title', issue: 'required' });
    }

    if (!['midterm', 'final', 'practice'].includes(type)) {
        details.push({ field: 'type', issue: 'invalid_enum' });
    }

    if (!semester) {
        details.push({ field: 'semester', issue: 'required' });
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
        details.push({ field: 'durationMinutes', issue: 'invalid_number' });
    }

    if (!['draft', 'open', 'closed'].includes(status)) {
        details.push({ field: 'status', issue: 'invalid_enum' });
    }

    return {
        details,
        value: {
            title,
            description,
            type,
            semester,
            durationMinutes,
            status,
        },
    };
}

function toExamResponse(exam) {
    return {
        examId: exam.id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        semester: exam.semester,
        durationMinutes: exam.duration_minutes,
        status: exam.status,
        publishedAt: exam.published_at,
        teacherName: exam.teacher_name || null,
        createdAt: exam.created_at,
        updatedAt: exam.updated_at,
    };
}

export class AdminExamsService {
    async listExams(query) {
        const { page, pageSize } = normalizePagination(query);
        const q = normalizeText(query.q) || null;
        const status = normalizeText(query.status) || null;

        if (status && !['draft', 'open', 'closed'].includes(status)) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'status', issue: 'invalid_enum' },
            ]);
        }

        const connection = await pool.getConnection();
        try {
            const repository = new AdminExamsRepository(connection);
            const { rows, total } = await repository.listExams({ q, status, page, pageSize });

            return {
                data: rows.map(toExamResponse),
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
                },
            };
        } finally {
            connection.release();
        }
    }

    async createExam(payload, adminUserId) {
        const { details, value } = validateExamPayload(payload || {});
        if (details.length > 0) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', details);
        }

        const connection = await pool.getConnection();
        try {
            const repository = new AdminExamsRepository(connection);
            const examId = await repository.createExam({ ...value, createdBy: adminUserId });
            const exam = await repository.findExamById(examId);
            return toExamResponse(exam);
        } finally {
            connection.release();
        }
    }

    async getExamDetail(examId) {
        const connection = await pool.getConnection();
        try {
            const repository = new AdminExamsRepository(connection);
            const exam = await repository.findExamById(examId);
            if (!exam || exam.deleted_at) {
                throw new AppError('Exam not found', 404, 'NOT_FOUND');
            }

            const questionCount = await repository.countQuestions(examId);
            return {
                ...toExamResponse(exam),
                questionCount,
            };
        } finally {
            connection.release();
        }
    }

    async updateExam(examId, payload) {
        const { details, value } = validateExamPayload(payload || {});
        if (details.length > 0) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', details);
        }

        const connection = await pool.getConnection();
        try {
            const repository = new AdminExamsRepository(connection);
            const exam = await repository.findExamById(examId);
            if (!exam || exam.deleted_at) {
                throw new AppError('Exam not found', 404, 'NOT_FOUND');
            }

            await repository.updateExam(examId, value);
            const updated = await repository.findExamById(examId);
            return toExamResponse(updated);
        } finally {
            connection.release();
        }
    }

    async deleteExam(examId) {
        const connection = await pool.getConnection();
        try {
            const repository = new AdminExamsRepository(connection);
            const exam = await repository.findExamById(examId);
            if (!exam || exam.deleted_at) {
                throw new AppError('Exam not found', 404, 'NOT_FOUND');
            }

            await repository.softDeleteExam(examId);
            return { deleted: true };
        } finally {
            connection.release();
        }
    }

    async publishExam(examId) {
        const connection = await pool.getConnection();
        try {
            const repository = new AdminExamsRepository(connection);
            const exam = await repository.findExamById(examId);
            if (!exam || exam.deleted_at) {
                throw new AppError('Exam not found', 404, 'NOT_FOUND');
            }

            const questionCount = await repository.countQuestions(examId);
            if (questionCount <= 0) {
                throw new AppError('Exam has no questions', 422, 'BUSINESS_RULE_VIOLATION');
            }

            await repository.publishExam(examId);
            const published = await repository.findExamById(examId);
            return toExamResponse(published);
        } finally {
            connection.release();
        }
    }
}
