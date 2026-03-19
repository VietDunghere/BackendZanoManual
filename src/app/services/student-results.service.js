import { pool } from '../../configs/database.js';
import { AppError } from '../../utils/classes/app-error.js';
import { StudentResultsRepository } from '../repositories/student-results.repository.js';

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

export class StudentResultsService {
    async getResultDetail(resultId, studentId) {
        const connection = await pool.getConnection();

        try {
            const repository = new StudentResultsRepository(connection);
            const result = await repository.findResultById(resultId);

            if (!result) {
                throw new AppError('Result not found', 404, 'NOT_FOUND');
            }

            if (Number(result.student_id) !== Number(studentId)) {
                throw new AppError('You do not have permission to access this result', 403, 'FORBIDDEN');
            }

            return {
                resultId: result.id,
                attemptId: result.attempt_id,
                exam: {
                    examId: result.exam_id,
                    title: result.exam_title,
                    type: result.exam_type,
                    semester: result.exam_semester,
                },
                score: Number(result.score),
                correctCount: Number(result.correct_count),
                totalQuestions: Number(result.total_questions),
                submittedAt: result.submitted_at,
            };
        } finally {
            connection.release();
        }
    }

    async listResults(query, studentId) {
        const { page, pageSize } = normalizePagination(query);
        const examId = query.examId ? Number(query.examId) : null;

        const connection = await pool.getConnection();

        try {
            const repository = new StudentResultsRepository(connection);
            const { rows, total } = await repository.listResults({ studentId, examId, page, pageSize });

            return {
                data: rows.map((item) => ({
                    resultId: item.id,
                    attemptId: item.attempt_id,
                    examId: item.exam_id,
                    examTitle: item.exam_title,
                    score: Number(item.score),
                    correctCount: Number(item.correct_count),
                    totalQuestions: Number(item.total_questions),
                    submittedAt: item.submitted_at,
                })),
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
}
