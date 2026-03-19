class StudentResultsRepository {
    constructor(connection) {
        this.connection = connection;
    }

    async findResultById(resultId) {
        const [rows] = await this.connection.query(
            `
				SELECT
					r.id,
					r.attempt_id,
					r.exam_id,
					r.student_id,
					r.score,
					r.correct_count,
					r.total_questions,
					r.submitted_at,
					e.title AS exam_title,
					e.type AS exam_type,
					e.semester AS exam_semester
				FROM results r
				INNER JOIN exams e ON e.id = r.exam_id
				WHERE r.id = ?
				LIMIT 1
			`,
            [resultId],
        );

        return rows[0] || null;
    }

    async listResults({ studentId, examId, page, pageSize }) {
        const offset = (page - 1) * pageSize;
        const conditions = ['r.student_id = ?'];
        const params = [studentId];

        if (examId) {
            conditions.push('r.exam_id = ?');
            params.push(examId);
        }

        const whereClause = conditions.join(' AND ');

        const [rows] = await this.connection.query(
            `
				SELECT
					r.id,
					r.attempt_id,
					r.exam_id,
					r.score,
					r.correct_count,
					r.total_questions,
					r.submitted_at,
					e.title AS exam_title
				FROM results r
				INNER JOIN exams e ON e.id = r.exam_id
				WHERE ${whereClause}
				ORDER BY r.submitted_at DESC, r.id DESC
				LIMIT ? OFFSET ?
			`,
            [...params, pageSize, offset],
        );

        const [countRows] = await this.connection.query(
            `
				SELECT COUNT(*) AS total
				FROM results r
				WHERE ${whereClause}
			`,
            params,
        );

        return {
            rows,
            total: Number(countRows[0].total),
        };
    }
}

export { StudentResultsRepository };
