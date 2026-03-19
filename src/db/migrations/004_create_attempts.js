export async function up(connection) {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attempts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        exam_id BIGINT UNSIGNED NOT NULL,
        student_id BIGINT UNSIGNED NOT NULL,
        started_at DATETIME NOT NULL,
        expires_at DATETIME NOT NULL,
        submitted_at DATETIME NULL,
        status ENUM('in_progress', 'submitted', 'expired') NOT NULL DEFAULT 'in_progress',
        score DECIMAL(5,2) NULL,
        correct_count INT UNSIGNED NULL,
        total_questions INT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_attempts_exam_id FOREIGN KEY (exam_id) REFERENCES exams(id),
        CONSTRAINT fk_attempts_student_id FOREIGN KEY (student_id) REFERENCES users(id)
      ) ENGINE=InnoDB;
    `);
}

export async function down(connection) {
  await connection.query('DROP TABLE IF EXISTS attempts;');
}
