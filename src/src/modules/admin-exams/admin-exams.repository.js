class AdminExamsRepository {
    constructor(connection) {
        this.connection = connection;
    }

    async listExams({ q, status, page, pageSize }) {
        const conditions = ['e.deleted_at IS NULL'];
        const params = [];

        if (q) {
            conditions.push('(e.title LIKE ? OR e.description LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }

        if (status) {
            conditions.push('e.status = ?');
            params.push(status);
        }

        const whereClause = conditions.join(' AND ');
        const offset = (page - 1) * pageSize;

        const [rows] = await this.connection.query(
            `
				SELECT e.id, e.title, e.description, e.type, e.semester, e.duration_minutes, e.status, e.published_at, e.created_at, e.updated_at,
					u.full_name AS teacher_name
				FROM exams e
				INNER JOIN users u ON u.id = e.created_by
				WHERE ${whereClause}
				ORDER BY e.created_at DESC, e.id DESC
				LIMIT ? OFFSET ?
			`,
            [...params, pageSize, offset],
        );

        const [countRows] = await this.connection.query(
            `
				SELECT COUNT(*) AS total
				FROM exams e
				WHERE ${whereClause}
			`,
            params,
        );

        return {
            rows,
            total: Number(countRows[0].total),
        };
    }

    async createExam({ title, description, type, semester, durationMinutes, status, createdBy }) {
        const [result] = await this.connection.query(
            `
				INSERT INTO exams (title, description, type, semester, duration_minutes, status, created_by)
				VALUES (?, ?, ?, ?, ?, ?, ?)
			`,
            [title, description, type, semester, durationMinutes, status, createdBy],
        );

        return result.insertId;
    }

    async findExamById(examId) {
        const [rows] = await this.connection.query(
            `
				SELECT id, title, description, type, semester, duration_minutes, status, published_at, created_by, created_at, updated_at, deleted_at
				FROM exams
				WHERE id = ?
				LIMIT 1
			`,
            [examId],
        );

        return rows[0] || null;
    }

    async updateExam(examId, { title, description, type, semester, durationMinutes, status }) {
        await this.connection.query(
            `
				UPDATE exams
				SET title = ?,
					description = ?,
					type = ?,
					semester = ?,
					duration_minutes = ?,
					status = ?,
					updated_at = UTC_TIMESTAMP()
				WHERE id = ?
					AND deleted_at IS NULL
			`,
            [title, description, type, semester, durationMinutes, status, examId],
        );
    }

    async softDeleteExam(examId) {
        await this.connection.query(
            `
				UPDATE exams
				SET deleted_at = UTC_TIMESTAMP(),
					updated_at = UTC_TIMESTAMP()
				WHERE id = ?
					AND deleted_at IS NULL
			`,
            [examId],
        );
    }

    async countQuestions(examId) {
        const [rows] = await this.connection.query(
            `
				SELECT COUNT(*) AS total
				FROM questions
				WHERE exam_id = ?
					AND deleted_at IS NULL
			`,
            [examId],
        );

        return Number(rows[0].total);
    }

    async publishExam(examId) {
        await this.connection.query(
            `
				UPDATE exams
				SET status = 'open',
					published_at = COALESCE(published_at, UTC_TIMESTAMP()),
					updated_at = UTC_TIMESTAMP()
				WHERE id = ?
					AND deleted_at IS NULL
			`,
            [examId],
        );
    }
}

module.exports = { AdminExamsRepository };
