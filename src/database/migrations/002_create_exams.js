module.exports = {
  async up(connection) {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        type ENUM('midterm', 'final', 'practice') NOT NULL,
        semester VARCHAR(20) NOT NULL,
        duration_minutes INT UNSIGNED NOT NULL,
        status ENUM('draft', 'open', 'closed') NOT NULL DEFAULT 'draft',
        published_at DATETIME NULL,
        created_by BIGINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        CONSTRAINT fk_exams_created_by FOREIGN KEY (created_by) REFERENCES users(id)
      ) ENGINE=InnoDB;
    `);
  },

  async down(connection) {
    await connection.query('DROP TABLE IF EXISTS exams;');
  },
};
