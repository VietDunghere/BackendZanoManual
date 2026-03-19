import bcrypt from 'bcryptjs';

import { pool, withTransaction } from '../../src/configs/database.js';

const ADMIN_PASSWORD = 'Admin@123';
const STUDENT_PASSWORD = 'Student@123';

function getOptionLabel(index) {
  const labels = ['A', 'B', 'C', 'D'];
  return labels[index % labels.length];
}

async function clearData(connection) {
  await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
  await connection.query('TRUNCATE TABLE refresh_tokens;');
  await connection.query('TRUNCATE TABLE results;');
  await connection.query('TRUNCATE TABLE answers;');
  await connection.query('TRUNCATE TABLE attempts;');
  await connection.query('TRUNCATE TABLE questions;');
  await connection.query('TRUNCATE TABLE exams;');
  await connection.query('TRUNCATE TABLE users;');
  await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
}

async function insertUsers(connection) {
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);

  await connection.query(
    `
      INSERT INTO users (username, email, password_hash, full_name, role, class_name, is_active)
      VALUES
      (?, ?, ?, ?, 'admin', NULL, 1),
      (?, ?, ?, ?, 'student', ?, 1),
      (?, ?, ?, ?, 'student', ?, 1)
    `,
    [
      'admin01',
      'admin01@local.test',
      adminHash,
      'System Administrator',
      'B20DCCN001',
      'b20dccn001@local.test',
      studentHash,
      'Student B20DCCN001',
      'D20CQCN01-B',
      'B20DCCN002',
      'b20dccn002@local.test',
      studentHash,
      'Student B20DCCN002',
      'D20CQCN01-B',
    ]
  );

  const [rows] = await connection.query('SELECT id, username FROM users');
  const usersByUsername = rows.reduce((acc, row) => {
    acc[row.username] = row.id;
    return acc;
  }, {});

  return usersByUsername;
}

async function insertExamsAndQuestions(connection, createdBy) {
  const now = new Date();
  const inOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await connection.query(
    `
      INSERT INTO exams (title, description, type, semester, duration_minutes, status, published_at, created_by)
      VALUES
      ('Lap trinh Web co ban', 'De thi giua ky mon lap trinh web', 'midterm', '2025A', 60, 'open', ?, ?),
      ('Co so du lieu nang cao', 'De thi luyen tap CSDL', 'practice', '2025A', 45, 'open', ?, ?),
      ('Kien truc phan mem', 'De thi cuoi ky', 'final', '2024B', 90, 'closed', ?, ?)
    `,
    [now, createdBy, now, createdBy, inOneDay, createdBy]
  );

  const [examRows] = await connection.query('SELECT id, title FROM exams ORDER BY id ASC');

  for (const exam of examRows) {
    const questionValues = [];
    const params = [];

    for (let i = 1; i <= 10; i += 1) {
      questionValues.push('(?, ?, ?, ?, ?, ?, ?, ?)');
      params.push(
        exam.id,
        `Cau hoi ${i} - ${exam.title}`,
        `Phuong an A - cau ${i}`,
        `Phuong an B - cau ${i}`,
        `Phuong an C - cau ${i}`,
        `Phuong an D - cau ${i}`,
        getOptionLabel(i),
        i
      );
    }

    await connection.query(
      `
        INSERT INTO questions (exam_id, content, option_a, option_b, option_c, option_d, correct_option_label, order_no)
        VALUES ${questionValues.join(', ')}
      `,
      params
    );
  }

  return examRows;
}

async function insertAttemptsAnswersResults(connection, usersByUsername, exams) {
  const examOpen = exams[0];
  const examPractice = exams[1];

  const [questionsOpen] = await connection.query(
    'SELECT id, correct_option_label FROM questions WHERE exam_id = ? ORDER BY order_no ASC',
    [examOpen.id]
  );

  const [questionsPractice] = await connection.query(
    'SELECT id, correct_option_label FROM questions WHERE exam_id = ? ORDER BY order_no ASC',
    [examPractice.id]
  );

  const startedAt = new Date(Date.now() - 50 * 60 * 1000);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const submittedAt = new Date(Date.now() - 10 * 60 * 1000);
  const startedAt2 = new Date(Date.now() - 120 * 60 * 1000);
  const expiresAt2 = new Date(Date.now() - 60 * 60 * 1000);
  const submittedAt2 = new Date(Date.now() - 65 * 60 * 1000);

  const [attempt1] = await connection.query(
    `
      INSERT INTO attempts (exam_id, student_id, started_at, expires_at, submitted_at, status, score, correct_count, total_questions)
      VALUES (?, ?, ?, ?, ?, 'submitted', ?, ?, ?)
    `,
    [
      examOpen.id,
      usersByUsername.B20DCCN001,
      startedAt,
      expiresAt,
      submittedAt,
      80.0,
      8,
      questionsOpen.length,
    ]
  );

  const [attempt2] = await connection.query(
    `
      INSERT INTO attempts (exam_id, student_id, started_at, expires_at, submitted_at, status, score, correct_count, total_questions)
      VALUES (?, ?, ?, ?, ?, 'submitted', ?, ?, ?)
    `,
    [
      examPractice.id,
      usersByUsername.B20DCCN002,
      startedAt2,
      expiresAt2,
      submittedAt2,
      60.0,
      6,
      questionsPractice.length,
    ]
  );

  await connection.query(
    `
      INSERT INTO attempts (exam_id, student_id, started_at, expires_at, submitted_at, status, score, correct_count, total_questions)
      VALUES (?, ?, ?, ?, NULL, 'in_progress', NULL, NULL, ?)
    `,
    [examPractice.id, usersByUsername.B20DCCN001, new Date(), new Date(Date.now() + 30 * 60 * 1000), questionsPractice.length]
  );

  const answerRowsAttempt1 = questionsOpen.map((question, index) => {
    const selected = index < 8 ? question.correct_option_label : 'A';
    return [attempt1.insertId, question.id, selected, selected === question.correct_option_label ? 1 : 0, submittedAt];
  });

  const answerRowsAttempt2 = questionsPractice.map((question, index) => {
    const selected = index < 6 ? question.correct_option_label : 'B';
    return [attempt2.insertId, question.id, selected, selected === question.correct_option_label ? 1 : 0, submittedAt2];
  });

  const allAnswerRows = [...answerRowsAttempt1, ...answerRowsAttempt2];
  const values = allAnswerRows.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const params = allAnswerRows.flat();

  await connection.query(
    `
      INSERT INTO answers (attempt_id, question_id, selected_option_label, is_correct, answered_at)
      VALUES ${values}
    `,
    params
  );

  await connection.query(
    `
      INSERT INTO results (attempt_id, exam_id, student_id, score, correct_count, total_questions, submitted_at)
      VALUES
      (?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      attempt1.insertId,
      examOpen.id,
      usersByUsername.B20DCCN001,
      80.0,
      8,
      questionsOpen.length,
      submittedAt,
      attempt2.insertId,
      examPractice.id,
      usersByUsername.B20DCCN002,
      60.0,
      6,
      questionsPractice.length,
      submittedAt2,
    ]
  );
}

async function seed() {
  await withTransaction(async (connection) => {
    await clearData(connection);

    const usersByUsername = await insertUsers(connection);
    const exams = await insertExamsAndQuestions(connection, usersByUsername.admin01);

    await insertAttemptsAnswersResults(connection, usersByUsername, exams);
  });

  console.log('[seed] done');
  console.log('[seed] default accounts:');
  console.log('  - admin01 / Admin@123');
  console.log('  - B20DCCN001 / Student@123');
  console.log('  - B20DCCN002 / Student@123');
}

seed()
  .catch((error) => {
    console.error('[seed] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
