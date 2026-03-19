class AuthRepository {
	constructor(connection) {
		this.connection = connection;
	}

	async findUserByUsername(username) {
		const [rows] = await this.connection.query(
			`
				SELECT id, username, email, password_hash, full_name, role, class_name, is_active
				FROM users
				WHERE username = ?
				LIMIT 1
			`,
			[username]
		);

		return rows[0] || null;
	}

	async findUserByEmail(email) {
		const [rows] = await this.connection.query(
			`
				SELECT id, username, email, password_hash, full_name, role, class_name, is_active
				FROM users
				WHERE email = ?
				LIMIT 1
			`,
			[email]
		);

		return rows[0] || null;
	}

	async findUserById(userId) {
		const [rows] = await this.connection.query(
			`
				SELECT id, username, email, full_name, role, class_name, is_active
				FROM users
				WHERE id = ?
				LIMIT 1
			`,
			[userId]
		);

		return rows[0] || null;
	}

	async createUser({ username, email, passwordHash, fullName, role, className }) {
		const [result] = await this.connection.query(
			`
				INSERT INTO users (username, email, password_hash, full_name, role, class_name, is_active)
				VALUES (?, ?, ?, ?, ?, ?, 1)
			`,
			[username, email, passwordHash, fullName, role, className]
		);

		return result.insertId;
	}

	async insertRefreshToken({ userId, tokenHash, expiresAt }) {
		await this.connection.query(
			`
				INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
				VALUES (?, ?, ?)
			`,
			[userId, tokenHash, expiresAt]
		);
	}

	async findActiveRefreshToken(tokenHash) {
		const [rows] = await this.connection.query(
			`
				SELECT id, user_id, token_hash, expires_at, revoked_at, replaced_by_token_hash
				FROM refresh_tokens
				WHERE token_hash = ?
					AND revoked_at IS NULL
					AND expires_at > UTC_TIMESTAMP()
				LIMIT 1
			`,
			[tokenHash]
		);

		return rows[0] || null;
	}

	async revokeRefreshToken(tokenHash, replacedByTokenHash = null) {
		await this.connection.query(
			`
				UPDATE refresh_tokens
				SET revoked_at = UTC_TIMESTAMP(),
						replaced_by_token_hash = ?
				WHERE token_hash = ?
					AND revoked_at IS NULL
			`,
			[replacedByTokenHash, tokenHash]
		);
	}
}

export { AuthRepository };
