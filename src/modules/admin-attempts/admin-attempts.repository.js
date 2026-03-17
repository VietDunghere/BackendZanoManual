class AdminAttemptsRepository {
    constructor(connection) {
        this.connection = connection;
    }

    async findAttemptById(attemptId) {
        const [rows] = await this.connection.query(
            `
				SELECT
					a.id,
					a.exam_id,
					a.student_id,
					a.started_at,
					a.expires_at,
					a.submitted_at,
					a.status,
					a.score,
					a.correct_count,
					a.total_questions,
					e.title AS exam_title,
					u.username AS student_code,
					u.full_name AS student_name
				FROM attempts a
				INNER JOIN exams e ON e.id = a.exam_id
				INNER JOIN users u ON u.id = a.student_id
				WHERE a.id = ?
				LIMIT 1
			`,
            [attemptId],
        );

        return rows[0] || null;
    }

    async listAttemptAnswers(attemptId) {
        const [rows] = await this.connection.query(
            `
				SELECT
					q.id AS question_id,
					q.content,
					q.option_a,
					q.option_b,
					q.option_c,
					q.option_d,
					q.correct_option_label,
					q.order_no,
					a.selected_option_label,
					a.is_correct,
					a.answered_at
				FROM attempts atp
				INNER JOIN questions q ON q.exam_id = atp.exam_id AND q.deleted_at IS NULL
				LEFT JOIN answers a ON a.attempt_id = atp.id AND a.question_id = q.id
				WHERE atp.id = ?
				ORDER BY q.order_no ASC, q.id ASC
			`,
            [attemptId],
        );

        return rows;
    }
}

module.exports = { AdminAttemptsRepository };
