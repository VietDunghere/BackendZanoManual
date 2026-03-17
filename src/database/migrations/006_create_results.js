module.exports = {
  async up(connection) {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS results (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        attempt_id BIGINT UNSIGNED NOT NULL,
        exam_id BIGINT UNSIGNED NOT NULL,
        student_id BIGINT UNSIGNED NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        correct_count INT UNSIGNED NOT NULL,
        total_questions INT UNSIGNED NOT NULL,
        submitted_at DATETIME NOT NULL,
        CONSTRAINT fk_results_attempt_id FOREIGN KEY (attempt_id) REFERENCES attempts(id),
        CONSTRAINT fk_results_exam_id FOREIGN KEY (exam_id) REFERENCES exams(id),
        CONSTRAINT fk_results_student_id FOREIGN KEY (student_id) REFERENCES users(id),
        UNIQUE KEY uq_results_attempt_id (attempt_id)
      ) ENGINE=InnoDB;
    `);
  },

  async down(connection) {
    await connection.query('DROP TABLE IF EXISTS results;');
  },
};
