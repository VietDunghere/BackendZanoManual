CREATE DATABASE IF NOT EXISTS backendzano_local
	CHARACTER SET utf8mb4
	COLLATE utf8mb4_unicode_ci;

USE backendzano_local;

CREATE TABLE IF NOT EXISTS schema_migrations (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	migration_name VARCHAR(255) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uq_schema_migrations_name (migration_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(50) NOT NULL,
	email VARCHAR(255) NULL,
	password_hash VARCHAR(255) NOT NULL,
	full_name VARCHAR(150) NOT NULL,
	role ENUM('admin', 'student') NOT NULL,
	class_name VARCHAR(50) NULL,
	is_active TINYINT(1) NOT NULL DEFAULT 1,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_users_username (username),
	UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

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

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_type ON exams(type);
CREATE INDEX idx_exams_semester ON exams(semester);
CREATE INDEX idx_questions_exam_order ON questions(exam_id, order_no);
CREATE INDEX idx_attempts_student_created ON attempts(student_id, created_at DESC);
CREATE INDEX idx_attempts_exam_status ON attempts(exam_id, status);
CREATE INDEX idx_results_student_submitted ON results(student_id, submitted_at DESC);
CREATE INDEX idx_results_exam_submitted ON results(exam_id, submitted_at DESC);
