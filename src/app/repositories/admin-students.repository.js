class AdminStudentsRepository {
    constructor(connection) {
        this.connection = connection;
    }

    async listStudents({ q, page, pageSize }) {
        const conditions = ["u.role = 'student'"];
        const params = [];

        if (q) {
            conditions.push('(u.username LIKE ? OR u.full_name LIKE ? OR u.email LIKE ? OR u.class_name LIKE ?)');
            params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
        }

        const whereClause = conditions.join(' AND ');
        const offset = (page - 1) * pageSize;

        const [rows] = await this.connection.query(
            `
				SELECT u.id, u.username, u.full_name, u.class_name, u.email, u.is_active, u.created_at, u.updated_at
				FROM users u
				WHERE ${whereClause}
				ORDER BY u.created_at DESC, u.id DESC
				LIMIT ? OFFSET ?
			`,
            [...params, pageSize, offset],
        );

        const [countRows] = await this.connection.query(
            `
				SELECT COUNT(*) AS total
				FROM users u
				WHERE ${whereClause}
			`,
            params,
        );

        return {
            rows,
            total: Number(countRows[0].total),
        };
    }

    async findStudentById(studentId) {
        const [rows] = await this.connection.query(
            `
				SELECT id, username, full_name, class_name, email, is_active, created_at, updated_at
				FROM users
				WHERE id = ?
					AND role = 'student'
				LIMIT 1
			`,
            [studentId],
        );

        return rows[0] || null;
    }

    async findStudentByUsername(username) {
        const [rows] = await this.connection.query(
            `
				SELECT id, username
				FROM users
				WHERE username = ?
					AND role = 'student'
				LIMIT 1
			`,
            [username],
        );

        return rows[0] || null;
    }

    async createStudent({ username, fullName, className, email, passwordHash }) {
        const [result] = await this.connection.query(
            `
				INSERT INTO users (username, email, password_hash, full_name, role, class_name, is_active)
				VALUES (?, ?, ?, ?, 'student', ?, 1)
			`,
            [username, email, passwordHash, fullName, className],
        );

        return result.insertId;
    }

    async updateStudent(studentId, { username, fullName, className, email, isActive }) {
        await this.connection.query(
            `
				UPDATE users
				SET username = ?,
					full_name = ?,
					class_name = ?,
					email = ?,
					is_active = ?,
					updated_at = UTC_TIMESTAMP()
				WHERE id = ?
					AND role = 'student'
			`,
            [username, fullName, className, email, isActive, studentId],
        );
    }

    async deactivateStudent(studentId) {
        await this.connection.query(
            `
				UPDATE users
				SET is_active = 0,
					updated_at = UTC_TIMESTAMP()
				WHERE id = ?
					AND role = 'student'
			`,
            [studentId],
        );
    }

    async getStudentOverview(studentId) {
        const [rows] = await this.connection.query(
            `
				SELECT
					u.id,
					u.username,
					u.full_name,
					u.class_name,
					u.email,
					COUNT(r.id) AS total_attempts,
					COALESCE(AVG(r.score), 0) AS average_score
				FROM users u
				LEFT JOIN results r ON r.student_id = u.id
				WHERE u.id = ?
					AND u.role = 'student'
				GROUP BY u.id
				LIMIT 1
			`,
            [studentId],
        );

        return rows[0] || null;
    }

    async listStudentResults({ studentId, q, status, page, pageSize }) {
        const conditions = ['r.student_id = ?'];
        const params = [studentId];

        if (q) {
            conditions.push('e.title LIKE ?');
            params.push(`%${q}%`);
        }

        if (status) {
            conditions.push('a.status = ?');
            params.push(status);
        }

        const whereClause = conditions.join(' AND ');
        const offset = (page - 1) * pageSize;

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
					e.title AS exam_title,
					a.status AS attempt_status
				FROM results r
				INNER JOIN exams e ON e.id = r.exam_id
				INNER JOIN attempts a ON a.id = r.attempt_id
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
				INNER JOIN exams e ON e.id = r.exam_id
				INNER JOIN attempts a ON a.id = r.attempt_id
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

export { AdminStudentsRepository };
