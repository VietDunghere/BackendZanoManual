const { pool } = require('../../config/database');
const { AppError } = require('../../shared/errors/app-error');
const { AdminStatsRepository } = require('./admin-stats.repository');

function parseIsoDateTime(value, fieldName) {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
            { field: fieldName, issue: 'invalid_datetime' },
        ]);
    }

    return parsed.toISOString().slice(0, 19).replace('T', ' ');
}

class AdminStatsService {
    async getSummary() {
        const connection = await pool.getConnection();

        try {
            const repository = new AdminStatsRepository(connection);
            const summary = await repository.getSummary();
            const distribution = await repository.getScoreDistribution();

            return {
                totalAttempts: Number(summary.total_attempts),
                completionRate:
                    Number(summary.total_attempts) === 0
                        ? 0
                        : Number(
                              ((Number(summary.submitted_attempts) / Number(summary.total_attempts)) * 100).toFixed(2),
                          ),
                averageScore: Number(Number(summary.average_score).toFixed(2)),
                scoreDistribution: [
                    { range: '0-49', count: Number(distribution.range_0_49 || 0) },
                    { range: '50-69', count: Number(distribution.range_50_69 || 0) },
                    { range: '70-84', count: Number(distribution.range_70_84 || 0) },
                    { range: '85-100', count: Number(distribution.range_85_100 || 0) },
                ],
            };
        } finally {
            connection.release();
        }
    }

    async exportStats(query) {
        const format = typeof query.format === 'string' ? query.format.trim().toLowerCase() : 'pdf';
        if (format !== 'pdf') {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'format', issue: 'invalid_enum' },
            ]);
        }

        const examId = query.examId ? Number(query.examId) : null;
        if (examId && (!Number.isInteger(examId) || examId <= 0)) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'examId', issue: 'invalid_number' },
            ]);
        }

        const from = parseIsoDateTime(query.from, 'from');
        const to = parseIsoDateTime(query.to, 'to');

        if (from && to && from > to) {
            throw new AppError('Du lieu khong hop le', 400, 'VALIDATION_ERROR', [
                { field: 'from|to', issue: 'invalid_range' },
            ]);
        }

        const connection = await pool.getConnection();
        try {
            const repository = new AdminStatsRepository(connection);
            const rows = await repository.getExportRows({
                from,
                to,
                examId,
            });

            return {
                format: 'pdf',
                generatedAt: new Date().toISOString(),
                itemCount: rows.length,
                items: rows.map((item) => ({
                    resultId: item.id,
                    examId: item.exam_id,
                    examTitle: item.exam_title,
                    studentId: item.student_id,
                    studentCode: item.student_code,
                    score: Number(item.score),
                    correctCount: Number(item.correct_count),
                    totalQuestions: Number(item.total_questions),
                    submittedAt: item.submitted_at,
                })),
                note: 'Local MVP returns JSON payload as export preview',
            };
        } finally {
            connection.release();
        }
    }
}

module.exports = { AdminStatsService };
