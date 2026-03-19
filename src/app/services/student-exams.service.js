import { pool } from '../../configs/database.js';
import { AppError } from '../../utils/classes/app-error.js';
import { StudentExamsRepository } from '../repositories/student-exams.repository.js';

function toExamResponse(exam) {
    return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        semester: exam.semester,
        durationMinutes: exam.duration_minutes,
        status: exam.status,
        publishedAt: exam.published_at,
        createdAt: exam.created_at,
        updatedAt: exam.updated_at,
    };
}

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

export class StudentExamsService {
    async listExams(query) {
        const { page, pageSize } = normalizePagination(query);
        const q = typeof query.q === 'string' ? query.q.trim() : '';
        const type = typeof query.type === 'string' ? query.type.trim() : '';
        const status = typeof query.status === 'string' ? query.status.trim() : '';

        if (type && !['midterm', 'final', 'practice'].includes(type)) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'type', issue: 'invalid_enum' },
            ]);
        }

        if (status && !['open', 'closed'].includes(status)) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'status', issue: 'invalid_enum' },
            ]);
        }

        const connection = await pool.getConnection();

        try {
            const repository = new StudentExamsRepository(connection);
            const { rows, total } = await repository.listExams({
                page,
                pageSize,
                q: q || null,
                type: type || null,
                status: status || null,
            });

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

    async getExamDetail(examId) {
        const connection = await pool.getConnection();

        try {
            const repository = new StudentExamsRepository(connection);
            const exam = await repository.findExamDetailById(examId);

            if (!exam) {
                throw new AppError('Exam not found', 404, 'NOT_FOUND');
            }

            return {
                id: exam.id,
                title: exam.title,
                description: exam.description,
                type: exam.type,
                semester: exam.semester,
                durationMinutes: exam.duration_minutes,
                status: exam.status,
                publishedAt: exam.published_at,
                questionCount: Number(exam.question_count),
                createdAt: exam.created_at,
                updatedAt: exam.updated_at,
            };
        } finally {
            connection.release();
        }
    }

    async startAttempt(examId, studentId) {
        const connection = await pool.getConnection();

        try {
            const repository = new StudentExamsRepository(connection);

            const exam = await repository.findExamById(examId);
            if (!exam) {
                throw new AppError('Exam not found', 404, 'NOT_FOUND');
            }

            if (exam.status !== 'open') {
                throw new AppError('Exam is not available for attempt', 422, 'BUSINESS_RULE_VIOLATION');
            }

            const activeAttempt = await repository.findActiveAttempt(examId, studentId);
            if (activeAttempt) {
                throw new AppError('An active attempt already exists for this exam', 409, 'CONFLICT');
            }

            const totalQuestions = await repository.countQuestionsByExamId(examId);
            if (totalQuestions <= 0) {
                throw new AppError('Exam has no questions', 422, 'BUSINESS_RULE_VIOLATION');
            }

            const startedAt = new Date();
            const expiresAt = new Date(startedAt.getTime() + exam.duration_minutes * 60 * 1000);

            const attemptId = await repository.createAttempt({
                examId,
                studentId,
                startedAt,
                expiresAt,
                totalQuestions,
            });

            const attempt = await repository.findAttemptById(attemptId);

            return {
                id: attempt.id,
                examId: attempt.exam_id,
                studentId: attempt.student_id,
                startedAt: attempt.started_at,
                expiresAt: attempt.expires_at,
                submittedAt: attempt.submitted_at,
                status: attempt.status,
                score: attempt.score,
                correctCount: attempt.correct_count,
                totalQuestions: attempt.total_questions,
                createdAt: attempt.created_at,
            };
        } finally {
            connection.release();
        }
    }
}
