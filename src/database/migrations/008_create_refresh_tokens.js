module.exports = {
  async up(connection) {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        revoked_at DATETIME NULL,
        replaced_by_token_hash CHAR(64) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_refresh_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY uq_refresh_tokens_token_hash (token_hash),
        KEY idx_refresh_tokens_user_id (user_id),
        KEY idx_refresh_tokens_expires_at (expires_at)
      ) ENGINE=InnoDB;
    `);
  },

  async down(connection) {
    await connection.query('DROP TABLE IF EXISTS refresh_tokens;');
  },
};
