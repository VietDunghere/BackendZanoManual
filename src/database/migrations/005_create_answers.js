module.exports = {
  async up(connection) {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        attempt_id BIGINT UNSIGNED NOT NULL,
        question_id BIGINT UNSIGNED NOT NULL,
        selected_option_label ENUM('A', 'B', 'C', 'D') NOT NULL,
        is_correct TINYINT(1) NULL,
        answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_answers_attempt_id FOREIGN KEY (attempt_id) REFERENCES attempts(id),
        CONSTRAINT fk_answers_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
        UNIQUE KEY uq_answers_attempt_question (attempt_id, question_id)
      ) ENGINE=InnoDB;
    `);
  },

  async down(connection) {
    await connection.query('DROP TABLE IF EXISTS answers;');
  },
};
