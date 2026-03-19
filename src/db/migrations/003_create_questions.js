export async function up(connection) {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        exam_id BIGINT UNSIGNED NOT NULL,
        content TEXT NOT NULL,
        option_a VARCHAR(255) NOT NULL,
        option_b VARCHAR(255) NOT NULL,
        option_c VARCHAR(255) NOT NULL,
        option_d VARCHAR(255) NOT NULL,
        correct_option_label ENUM('A', 'B', 'C', 'D') NOT NULL,
        order_no INT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        CONSTRAINT fk_questions_exam_id FOREIGN KEY (exam_id) REFERENCES exams(id)
      ) ENGINE=InnoDB;
    `);
}

export async function down(connection) {
  await connection.query('DROP TABLE IF EXISTS questions;');
}
