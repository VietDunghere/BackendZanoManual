class StudentExamsRepository {
    constructor(connection) {
        this.connection = connection;
    }

    async listExams({ page, pageSize, q, type, status }) {
        const conditions = ['deleted_at IS NULL', "status <> 'draft'"];
        const params = [];

        if (q) {
            conditions.push('(title LIKE ? OR description LIKE ?)');
            params.push(`%${q}%`, `%${q}%`);
        }

        if (type) {
            conditions.push('type = ?');
            params.push(type);
        }

        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }

        const whereClause = conditions.join(' AND ');
        const offset = (page - 1) * pageSize;

        const [rows] = await this.connection.query(
            `
				SELECT id, title, description, type, semester, duration_minutes, status, published_at, created_at, updated_at
				FROM exams
				WHERE ${whereClause}
				ORDER BY published_at DESC, id DESC
				LIMIT ? OFFSET ?
			`,
            [...params, pageSize, offset],
        );

        const [countRows] = await this.connection.query(
            `
				SELECT COUNT(*) AS total
				FROM exams
				WHERE ${whereClause}
			`,
            params,
        );

        return {
            rows,
            total: Number(countRows[0].total),
        };
    }

    async findExamById(examId) {
        const [rows] = await this.connection.query(
            `
				SELECT id, title, type, semester, duration_minutes, status, published_at
				FROM exams
				WHERE id = ?
					AND deleted_at IS NULL
				LIMIT 1
			`,
            [examId],
        );

        return rows[0] || null;
    }

    async findExamDetailById(examId) {
        const [rows] = await this.connection.query(
            `
				SELECT
					e.id,
					e.title,
					e.description,
					e.type,
					e.semester,
					e.duration_minutes,
					e.status,
					e.published_at,
					e.created_at,
					e.updated_at,
					COUNT(q.id) AS question_count
				FROM exams e
				LEFT JOIN questions q ON q.exam_id = e.id AND q.deleted_at IS NULL
				WHERE e.id = ?
					AND e.deleted_at IS NULL
					AND e.status <> 'draft'
				GROUP BY e.id
				LIMIT 1
			`,
            [examId],
        );

        return rows[0] || null;
    }

    async countQuestionsByExamId(examId) {
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

    async findActiveAttempt(examId, studentId) {
        const [rows] = await this.connection.query(
            `
				SELECT id, exam_id, student_id, started_at, expires_at, status
				FROM attempts
				WHERE exam_id = ?
					AND student_id = ?
					AND status = 'in_progress'
					AND expires_at > UTC_TIMESTAMP()
				ORDER BY id DESC
				LIMIT 1
			`,
            [examId, studentId],
        );

        return rows[0] || null;
    }

    async createAttempt({ examId, studentId, startedAt, expiresAt, totalQuestions }) {
        const [result] = await this.connection.query(
            `
				INSERT INTO attempts (exam_id, student_id, started_at, expires_at, submitted_at, status, score, correct_count, total_questions)
				VALUES (?, ?, ?, ?, NULL, 'in_progress', NULL, NULL, ?)
			`,
            [examId, studentId, startedAt, expiresAt, totalQuestions],
        );

        return result.insertId;
    }

    async findAttemptById(attemptId) {
        const [rows] = await this.connection.query(
            `
				SELECT id, exam_id, student_id, started_at, expires_at, submitted_at, status, score, correct_count, total_questions, created_at
				FROM attempts
				WHERE id = ?
				LIMIT 1
			`,
            [attemptId],
        );

        return rows[0] || null;
    }
}

export { StudentExamsRepository };
