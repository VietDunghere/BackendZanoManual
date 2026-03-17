class StudentAttemptsRepository {
	constructor(connection) {
		this.connection = connection;
	}

	async findAttemptById(attemptId) {
		const [rows] = await this.connection.query(
			`
				SELECT id, exam_id, student_id, started_at, expires_at, submitted_at, status, score, correct_count, total_questions
				FROM attempts
				WHERE id = ?
				LIMIT 1
			`,
			[attemptId]
		);

		return rows[0] || null;
	}

	async findAttemptByIdForStudent(attemptId, studentId) {
		const [rows] = await this.connection.query(
			`
				SELECT id, exam_id, student_id, started_at, expires_at, submitted_at, status, score, correct_count, total_questions
				FROM attempts
				WHERE id = ?
					AND student_id = ?
				LIMIT 1
			`,
			[attemptId, studentId]
		);

		return rows[0] || null;
	}

	async findAttemptByIdForUpdate(attemptId) {
		const [rows] = await this.connection.query(
			`
				SELECT id, exam_id, student_id, started_at, expires_at, submitted_at, status, score, correct_count, total_questions
				FROM attempts
				WHERE id = ?
				LIMIT 1
				FOR UPDATE
			`,
			[attemptId]
		);

		return rows[0] || null;
	}

	async listQuestionsByAttempt(attemptId) {
		const [rows] = await this.connection.query(
			`
				SELECT q.id, q.content, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option_label, q.order_no
				FROM attempts a
				INNER JOIN questions q ON q.exam_id = a.exam_id
				WHERE a.id = ?
					AND q.deleted_at IS NULL
				ORDER BY q.order_no ASC
			`,
			[attemptId]
		);

		return rows;
	}

	async listAnswersByAttempt(attemptId) {
		const [rows] = await this.connection.query(
			`
				SELECT id, attempt_id, question_id, selected_option_label, is_correct, answered_at
				FROM answers
				WHERE attempt_id = ?
			`,
			[attemptId]
		);

		return rows;
	}

	async findQuestionInAttempt(attemptId, questionId) {
		const [rows] = await this.connection.query(
			`
				SELECT q.id, q.correct_option_label
				FROM attempts a
				INNER JOIN questions q ON q.exam_id = a.exam_id
				WHERE a.id = ?
					AND q.id = ?
					AND q.deleted_at IS NULL
				LIMIT 1
			`,
			[attemptId, questionId]
		);

		return rows[0] || null;
	}

	async upsertAnswer({ attemptId, questionId, selectedOptionLabel }) {
		await this.connection.query(
			`
				INSERT INTO answers (attempt_id, question_id, selected_option_label, is_correct, answered_at)
				VALUES (?, ?, ?, NULL, UTC_TIMESTAMP())
				ON DUPLICATE KEY UPDATE
					selected_option_label = VALUES(selected_option_label),
					is_correct = NULL,
					answered_at = UTC_TIMESTAMP()
			`,
			[attemptId, questionId, selectedOptionLabel]
		);
	}

	async markAttemptExpired(attemptId) {
		await this.connection.query(
			`
				UPDATE attempts
				SET status = 'expired',
						updated_at = UTC_TIMESTAMP()
				WHERE id = ?
					AND status = 'in_progress'
			`,
			[attemptId]
		);
	}

	async setAnswerCorrectness(attemptId) {
		await this.connection.query(
			`
				UPDATE answers a
				INNER JOIN questions q ON q.id = a.question_id
				SET a.is_correct = (a.selected_option_label = q.correct_option_label)
				WHERE a.attempt_id = ?
			`,
			[attemptId]
		);
	}

	async markAttemptSubmitted({ attemptId, score, correctCount, totalQuestions }) {
		await this.connection.query(
			`
				UPDATE attempts
				SET submitted_at = UTC_TIMESTAMP(),
						status = 'submitted',
						score = ?,
						correct_count = ?,
						total_questions = ?,
						updated_at = UTC_TIMESTAMP()
				WHERE id = ?
			`,
			[score, correctCount, totalQuestions, attemptId]
		);
	}

	async createResult({ attemptId, examId, studentId, score, correctCount, totalQuestions }) {
		const [result] = await this.connection.query(
			`
				INSERT INTO results (attempt_id, exam_id, student_id, score, correct_count, total_questions, submitted_at)
				VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())
			`,
			[attemptId, examId, studentId, score, correctCount, totalQuestions]
		);

		return result.insertId;
	}

	async findResultByAttemptId(attemptId) {
		const [rows] = await this.connection.query(
			`
				SELECT id, attempt_id, exam_id, student_id, score, correct_count, total_questions, submitted_at
				FROM results
				WHERE attempt_id = ?
				LIMIT 1
			`,
			[attemptId]
		);

		return rows[0] || null;
	}
}

module.exports = { StudentAttemptsRepository };
