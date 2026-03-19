class AdminStatsRepository {
    constructor(connection) {
        this.connection = connection;
    }

    async getSummary() {
        const [rows] = await this.connection.query(
            `
				SELECT
					(SELECT COUNT(*) FROM attempts) AS total_attempts,
					(SELECT COUNT(*) FROM attempts WHERE status = 'submitted') AS submitted_attempts,
					COALESCE((SELECT AVG(score) FROM results), 0) AS average_score
			`,
        );

        return rows[0];
    }

    async getScoreDistribution() {
        const [rows] = await this.connection.query(
            `
				SELECT
					SUM(CASE WHEN score < 50 THEN 1 ELSE 0 END) AS range_0_49,
					SUM(CASE WHEN score >= 50 AND score < 70 THEN 1 ELSE 0 END) AS range_50_69,
					SUM(CASE WHEN score >= 70 AND score < 85 THEN 1 ELSE 0 END) AS range_70_84,
					SUM(CASE WHEN score >= 85 THEN 1 ELSE 0 END) AS range_85_100
				FROM results
			`,
        );

        return rows[0];
    }

    async getExportRows({ from, to, examId }) {
        const conditions = ['1 = 1'];
        const params = [];

        if (from) {
            conditions.push('r.submitted_at >= ?');
            params.push(from);
        }

        if (to) {
            conditions.push('r.submitted_at <= ?');
            params.push(to);
        }

        if (examId) {
            conditions.push('r.exam_id = ?');
            params.push(examId);
        }

        const whereClause = conditions.join(' AND ');

        const [rows] = await this.connection.query(
            `
				SELECT
					r.id,
					r.exam_id,
					e.title AS exam_title,
					r.student_id,
					u.username AS student_code,
					r.score,
					r.correct_count,
					r.total_questions,
					r.submitted_at
				FROM results r
				INNER JOIN exams e ON e.id = r.exam_id
				INNER JOIN users u ON u.id = r.student_id
				WHERE ${whereClause}
				ORDER BY r.submitted_at DESC, r.id DESC
			`,
            params,
        );

        return rows;
    }
}

export { AdminStatsRepository };
