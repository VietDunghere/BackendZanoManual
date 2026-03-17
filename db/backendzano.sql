CREATE DATABASE IF NOT EXISTS backendzano_local
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE backendzano_local;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE results;
TRUNCATE TABLE answers;
TRUNCATE TABLE attempts;
TRUNCATE TABLE questions;
TRUNCATE TABLE exams;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, username, email, password_hash, full_name, role, class_name, is_active, created_at, updated_at)
VALUES
  (1, 'admin01', 'admin01@local.test', '$2b$10$XCE.Er.1od9Ld0zNN3hNUOKUrEM..tbZEFioP46gZqu.0/jRl2alq', 'System Administrator', 'admin', NULL, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (2, 'B20DCCN001', 'b20dccn001@local.test', '$2b$10$JTOP4P73PMmxBdzNUOi4duuE7aNw3.wI.apAXb5wFvwn/fV.lBwti', 'Student B20DCCN001', 'student', 'D20CQCN01-B', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (3, 'B20DCCN002', 'b20dccn002@local.test', '$2b$10$JTOP4P73PMmxBdzNUOi4duuE7aNw3.wI.apAXb5wFvwn/fV.lBwti', 'Student B20DCCN002', 'student', 'D20CQCN01-B', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (4, 'B20DCCN003', 'b20dccn003@local.test', '$2b$10$JTOP4P73PMmxBdzNUOi4duuE7aNw3.wI.apAXb5wFvwn/fV.lBwti', 'Student B20DCCN003', 'student', 'D20CQCN02-A', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (5, 'B20DCCN004', 'b20dccn004@local.test', '$2b$10$JTOP4P73PMmxBdzNUOi4duuE7aNw3.wI.apAXb5wFvwn/fV.lBwti', 'Student B20DCCN004', 'student', 'D20CQCN02-A', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP());

INSERT INTO exams (id, title, description, type, semester, duration_minutes, status, published_at, created_by, created_at, updated_at, deleted_at)
VALUES
  (1, 'Lap trinh Web co ban', 'De thi giua ky mon lap trinh web', 'midterm', '2025A', 60, 'open', UTC_TIMESTAMP(), 1, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (2, 'Co so du lieu nang cao', 'De thi luyen tap CSDL', 'practice', '2025A', 45, 'open', UTC_TIMESTAMP(), 1, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (3, 'Kien truc phan mem', 'De thi cuoi ky', 'final', '2024B', 90, 'closed', UTC_TIMESTAMP(), 1, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (4, 'Tri tue nhan tao co ban', 'De thi luyen tap AI', 'practice', '2025B', 50, 'open', UTC_TIMESTAMP(), 1, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL);

INSERT INTO questions (id, exam_id, content, option_a, option_b, option_c, option_d, correct_option_label, order_no, created_at, updated_at, deleted_at)
VALUES
  (1, 1, 'Web Q1', 'A1', 'B1', 'C1', 'D1', 'A', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (2, 1, 'Web Q2', 'A2', 'B2', 'C2', 'D2', 'B', 2, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (3, 1, 'Web Q3', 'A3', 'B3', 'C3', 'D3', 'C', 3, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (4, 1, 'Web Q4', 'A4', 'B4', 'C4', 'D4', 'D', 4, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (5, 1, 'Web Q5', 'A5', 'B5', 'C5', 'D5', 'A', 5, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (6, 1, 'Web Q6', 'A6', 'B6', 'C6', 'D6', 'B', 6, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (7, 1, 'Web Q7', 'A7', 'B7', 'C7', 'D7', 'C', 7, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (8, 1, 'Web Q8', 'A8', 'B8', 'C8', 'D8', 'D', 8, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (9, 1, 'Web Q9', 'A9', 'B9', 'C9', 'D9', 'A', 9, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (10, 1, 'Web Q10', 'A10', 'B10', 'C10', 'D10', 'B', 10, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),

  (11, 2, 'CSDL Q1', 'A1', 'B1', 'C1', 'D1', 'A', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (12, 2, 'CSDL Q2', 'A2', 'B2', 'C2', 'D2', 'B', 2, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (13, 2, 'CSDL Q3', 'A3', 'B3', 'C3', 'D3', 'C', 3, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (14, 2, 'CSDL Q4', 'A4', 'B4', 'C4', 'D4', 'D', 4, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (15, 2, 'CSDL Q5', 'A5', 'B5', 'C5', 'D5', 'A', 5, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (16, 2, 'CSDL Q6', 'A6', 'B6', 'C6', 'D6', 'B', 6, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (17, 2, 'CSDL Q7', 'A7', 'B7', 'C7', 'D7', 'C', 7, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (18, 2, 'CSDL Q8', 'A8', 'B8', 'C8', 'D8', 'D', 8, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (19, 2, 'CSDL Q9', 'A9', 'B9', 'C9', 'D9', 'A', 9, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (20, 2, 'CSDL Q10', 'A10', 'B10', 'C10', 'D10', 'B', 10, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),

  (21, 3, 'KTPM Q1', 'A1', 'B1', 'C1', 'D1', 'A', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (22, 3, 'KTPM Q2', 'A2', 'B2', 'C2', 'D2', 'B', 2, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (23, 3, 'KTPM Q3', 'A3', 'B3', 'C3', 'D3', 'C', 3, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (24, 3, 'KTPM Q4', 'A4', 'B4', 'C4', 'D4', 'D', 4, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (25, 3, 'KTPM Q5', 'A5', 'B5', 'C5', 'D5', 'A', 5, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (26, 3, 'KTPM Q6', 'A6', 'B6', 'C6', 'D6', 'B', 6, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (27, 3, 'KTPM Q7', 'A7', 'B7', 'C7', 'D7', 'C', 7, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (28, 3, 'KTPM Q8', 'A8', 'B8', 'C8', 'D8', 'D', 8, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (29, 3, 'KTPM Q9', 'A9', 'B9', 'C9', 'D9', 'A', 9, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (30, 3, 'KTPM Q10', 'A10', 'B10', 'C10', 'D10', 'B', 10, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),

  (31, 4, 'AI Q1', 'A1', 'B1', 'C1', 'D1', 'A', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (32, 4, 'AI Q2', 'A2', 'B2', 'C2', 'D2', 'B', 2, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (33, 4, 'AI Q3', 'A3', 'B3', 'C3', 'D3', 'C', 3, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (34, 4, 'AI Q4', 'A4', 'B4', 'C4', 'D4', 'D', 4, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (35, 4, 'AI Q5', 'A5', 'B5', 'C5', 'D5', 'A', 5, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (36, 4, 'AI Q6', 'A6', 'B6', 'C6', 'D6', 'B', 6, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (37, 4, 'AI Q7', 'A7', 'B7', 'C7', 'D7', 'C', 7, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (38, 4, 'AI Q8', 'A8', 'B8', 'C8', 'D8', 'D', 8, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (39, 4, 'AI Q9', 'A9', 'B9', 'C9', 'D9', 'A', 9, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL),
  (40, 4, 'AI Q10', 'A10', 'B10', 'C10', 'D10', 'B', 10, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL);

INSERT INTO attempts (id, exam_id, student_id, started_at, expires_at, submitted_at, status, score, correct_count, total_questions, created_at, updated_at)
VALUES
  (1, 1, 2, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 55 MINUTE), DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 MINUTE), DATE_SUB(UTC_TIMESTAMP(), INTERVAL 10 MINUTE), 'submitted', 80.00, 8, 10, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (2, 2, 3, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 75 MINUTE), DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 MINUTE), DATE_SUB(UTC_TIMESTAMP(), INTERVAL 35 MINUTE), 'submitted', 60.00, 6, 10, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (3, 4, 2, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 35 MINUTE), NULL, 'in_progress', NULL, NULL, 10, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (4, 1, 4, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 90 MINUTE), DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 MINUTE), NULL, 'expired', NULL, NULL, 10, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
  (5, 2, 5, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 40 MINUTE), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 5 MINUTE), NULL, 'in_progress', NULL, NULL, 10, UTC_TIMESTAMP(), UTC_TIMESTAMP());

INSERT INTO answers (attempt_id, question_id, selected_option_label, is_correct, answered_at)
VALUES
  (1, 1, 'A', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20 MINUTE)),
  (1, 2, 'B', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20 MINUTE)),
  (1, 3, 'C', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20 MINUTE)),
  (1, 4, 'D', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20 MINUTE)),
  (1, 5, 'A', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20 MINUTE)),
  (1, 6, 'B', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20 MINUTE)),
  (1, 7, 'C', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20 MINUTE)),
  (1, 8, 'D', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20 MINUTE)),
  (1, 9, 'D', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20 MINUTE)),
  (1, 10, 'D', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20 MINUTE)),

  (2, 11, 'A', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)),
  (2, 12, 'B', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)),
  (2, 13, 'C', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)),
  (2, 14, 'D', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)),
  (2, 15, 'A', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)),
  (2, 16, 'B', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)),
  (2, 17, 'A', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)),
  (2, 18, 'A', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)),
  (2, 19, 'B', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)),
  (2, 20, 'C', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)),

  (3, 31, 'A', NULL, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 MINUTE)),
  (3, 32, 'C', NULL, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4 MINUTE)),
  (3, 33, 'C', NULL, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 MINUTE)),
  (5, 11, 'A', NULL, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 MINUTE));

INSERT INTO results (id, attempt_id, exam_id, student_id, score, correct_count, total_questions, submitted_at)
VALUES
  (1, 1, 1, 2, 80.00, 8, 10, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 10 MINUTE)),
  (2, 2, 2, 3, 60.00, 6, 10, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 35 MINUTE));

ALTER TABLE users AUTO_INCREMENT = 100;
ALTER TABLE exams AUTO_INCREMENT = 100;
ALTER TABLE questions AUTO_INCREMENT = 1000;
ALTER TABLE attempts AUTO_INCREMENT = 1000;
ALTER TABLE answers AUTO_INCREMENT = 10000;
ALTER TABLE results AUTO_INCREMENT = 1000;

-- Tai khoan mac dinh:
-- admin01 / Admin@123
-- B20DCCN001 / Student@123
-- B20DCCN002 / Student@123
-- B20DCCN003 / Student@123
-- B20DCCN004 / Student@123