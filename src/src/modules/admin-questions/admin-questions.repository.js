class AdminQuestionsRepository {
    constructor(connection) {
        this.connection = connection;
    }

    async findExamById(examId) {
        const [rows] = await this.connection.query(
            `
				SELECT id, status, deleted_at
				FROM exams
				WHERE id = ?
				LIMIT 1
			`,
            [examId],
        );

        return rows[0] || null;
    }

    async listQuestionsByExam(examId) {
        const [rows] = await this.connection.query(
            `
				SELECT id, exam_id, content, option_a, option_b, option_c, option_d, correct_option_label, order_no, created_at, updated_at
				FROM questions
				WHERE exam_id = ?
					AND deleted_at IS NULL
				ORDER BY order_no ASC, id ASC
			`,
            [examId],
        );

        return rows;
    }

    async getNextOrderNo(examId) {
        const [rows] = await this.connection.query(
            `
				SELECT COALESCE(MAX(order_no), 0) + 1 AS next_order_no
				FROM questions
				WHERE exam_id = ?
					AND deleted_at IS NULL
			`,
            [examId],
        );

        return Number(rows[0].next_order_no);
    }

    async createQuestion({ examId, content, optionA, optionB, optionC, optionD, correctOptionLabel, orderNo }) {
        const [result] = await this.connection.query(
            `
				INSERT INTO questions (exam_id, content, option_a, option_b, option_c, option_d, correct_option_label, order_no)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`,
            [examId, content, optionA, optionB, optionC, optionD, correctOptionLabel, orderNo],
        );

        return result.insertId;
    }

    async findQuestionById(examId, questionId) {
        const [rows] = await this.connection.query(
            `
				SELECT id, exam_id, content, option_a, option_b, option_c, option_d, correct_option_label, order_no, created_at, updated_at, deleted_at
				FROM questions
				WHERE exam_id = ?
					AND id = ?
				LIMIT 1
			`,
            [examId, questionId],
        );

        return rows[0] || null;
    }

    async updateQuestion(questionId, { content, optionA, optionB, optionC, optionD, correctOptionLabel }) {
        await this.connection.query(
            `
				UPDATE questions
				SET content = ?,
					option_a = ?,
					option_b = ?,
					option_c = ?,
					option_d = ?,
					correct_option_label = ?,
					updated_at = UTC_TIMESTAMP()
				WHERE id = ?
					AND deleted_at IS NULL
			`,
            [content, optionA, optionB, optionC, optionD, correctOptionLabel, questionId],
        );
    }

    async softDeleteQuestion(questionId) {
        await this.connection.query(
            `
				UPDATE questions
				SET deleted_at = UTC_TIMESTAMP(),
					updated_at = UTC_TIMESTAMP()
				WHERE id = ?
					AND deleted_at IS NULL
			`,
            [questionId],
        );
    }
}

module.exports = { AdminQuestionsRepository };
