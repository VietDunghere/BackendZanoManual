import { pool } from '../../configs/database.js';
import { AppError } from '../../utils/classes/app-error.js';
import { AdminAttemptsRepository } from '../repositories/admin-attempts.repository.js';

export class AdminAttemptsService {
    async getAttemptDetail(attemptId) {
        const connection = await pool.getConnection();

        try {
            const repository = new AdminAttemptsRepository(connection);
            const attempt = await repository.findAttemptById(attemptId);

            if (!attempt) {
                throw new AppError('Attempt not found', 404, 'NOT_FOUND');
            }

            const questions = await repository.listAttemptAnswers(attemptId);

            return {
                attemptId: attempt.id,
                exam: {
                    examId: attempt.exam_id,
                    title: attempt.exam_title,
                },
                student: {
                    studentId: attempt.student_id,
                    studentCode: attempt.student_code,
                    fullName: attempt.student_name,
                },
                status: attempt.status,
                score: attempt.score !== null ? Number(attempt.score) : null,
                correctCount: attempt.correct_count !== null ? Number(attempt.correct_count) : null,
                totalQuestions: Number(attempt.total_questions),
                startedAt: attempt.started_at,
                expiresAt: attempt.expires_at,
                submittedAt: attempt.submitted_at,
                questions: questions.map((item) => ({
                    questionId: item.question_id,
                    orderNo: item.order_no,
                    content: item.content,
                    options: [
                        { label: 'A', content: item.option_a },
                        { label: 'B', content: item.option_b },
                        { label: 'C', content: item.option_c },
                        { label: 'D', content: item.option_d },
                    ],
                    correctOptionLabel: item.correct_option_label,
                    selectedOptionLabel: item.selected_option_label || null,
                    isCorrect: item.is_correct === null ? null : Boolean(item.is_correct),
                    answeredAt: item.answered_at,
                })),
            };
        } finally {
            connection.release();
        }
    }
}
