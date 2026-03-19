export async function up(connection) {
    await connection.query('CREATE INDEX idx_users_role ON users(role);');
    await connection.query('CREATE INDEX idx_exams_status ON exams(status);');
    await connection.query('CREATE INDEX idx_exams_type ON exams(type);');
    await connection.query('CREATE INDEX idx_exams_semester ON exams(semester);');
    await connection.query('CREATE INDEX idx_questions_exam_order ON questions(exam_id, order_no);');
    await connection.query('CREATE INDEX idx_attempts_student_created ON attempts(student_id, created_at DESC);');
    await connection.query('CREATE INDEX idx_attempts_exam_status ON attempts(exam_id, status);');
    await connection.query('CREATE INDEX idx_results_student_submitted ON results(student_id, submitted_at DESC);');
    await connection.query('CREATE INDEX idx_results_exam_submitted ON results(exam_id, submitted_at DESC);');
}

export async function down(connection) {
  await connection.query('DROP INDEX idx_results_exam_submitted ON results;');
  await connection.query('DROP INDEX idx_results_student_submitted ON results;');
  await connection.query('DROP INDEX idx_attempts_exam_status ON attempts;');
  await connection.query('DROP INDEX idx_attempts_student_created ON attempts;');
  await connection.query('DROP INDEX idx_questions_exam_order ON questions;');
  await connection.query('DROP INDEX idx_exams_semester ON exams;');
  await connection.query('DROP INDEX idx_exams_type ON exams;');
  await connection.query('DROP INDEX idx_exams_status ON exams;');
  await connection.query('DROP INDEX idx_users_role ON users;');
}
