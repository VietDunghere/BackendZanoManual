# Step 03 - Database và dữ liệu test local

## Trạng thái
- Status: Done
- Ngày cập nhật: 2026-03-13
- Mục tiêu: Chốt thiết kế DB + dữ liệu test phục vụ toàn bộ flow local/Postman

## 1) Schema chuẩn hóa

### Bảng users
- id (PK)
- username (unique)
- email (unique, nullable)
- password_hash
- full_name
- role (admin|student)
- class_name (nullable)
- is_active
- created_at, updated_at

### Bảng exams
- id (PK)
- title
- description
- type (midterm|final|practice)
- semester
- duration_minutes
- status (draft|open|closed)
- published_at (nullable)
- created_by (FK users.id)
- created_at, updated_at, deleted_at (soft delete)

### Bảng questions
- id (PK)
- exam_id (FK exams.id)
- content
- option_a, option_b, option_c, option_d
- correct_option_label
- order_no
- created_at, updated_at, deleted_at

### Bảng attempts
- id (PK)
- exam_id (FK exams.id)
- student_id (FK users.id)
- started_at
- expires_at
- submitted_at (nullable)
- status (in_progress|submitted|expired)
- score (nullable)
- correct_count (nullable)
- total_questions
- created_at, updated_at

### Bảng answers
- id (PK)
- attempt_id (FK attempts.id)
- question_id (FK questions.id)
- selected_option_label
- is_correct (nullable trước submit)
- answered_at
- unique(attempt_id, question_id)

### Bảng results (khuyến nghị materialized từ attempts)
- id (PK)
- attempt_id (FK attempts.id, unique)
- exam_id (FK exams.id)
- student_id (FK users.id)
- score
- correct_count
- total_questions
- submitted_at

## 2) Index cho truy vấn chính
- users(username), users(role)
- exams(status), exams(type), exams(semester)
- questions(exam_id, order_no)
- attempts(student_id, created_at desc)
- attempts(exam_id, status)
- results(student_id, submitted_at desc)
- results(exam_id, submitted_at desc)
- answers(attempt_id, question_id) unique index

## 3) Migration local
- Migrations theo thứ tự:
  1. create_users
  2. create_exams
  3. create_questions
  4. create_attempts
  5. create_answers
  6. create_results
  7. add_indexes
- Quy tắc migration:
  - Mỗi migration có up/down rõ ràng.
  - Không sửa migration đã chạy; tạo migration mới cho thay đổi tiếp theo.
  - Có script chạy full migration từ DB trống.

## 4) Seed dữ liệu local bắt buộc

### User seed
- 1 admin: admin01
- 2 student: B20DCCN001, B20DCCN002

### Exam seed
- 2 exam open
- 1 exam closed
- Mỗi exam tối thiểu 10 câu

### Attempt/Result seed
- Mỗi student có ít nhất 1 attempt submitted
- Có ít nhất 1 attempt in_progress hoặc expired để test edge case

## 5) Script reset dữ liệu local
- Mục tiêu: reset nhanh để test Postman nhiều vòng
- Khuyến nghị script:
  - drop schema (hoặc truncate theo thứ tự FK)
  - migrate up
  - seed lại dữ liệu mẫu
- Tên script gợi ý:
  - db:reset
  - db:migrate
  - db:seed

## 6) Tiêu chí hoàn tất Step 03
- DB tạo được từ đầu bằng migration trên local.
- Seed chạy thành công, dữ liệu đủ cho toàn bộ flow student/admin.
- Postman có thể test list, create, submit, stats với dữ liệu seed.
- Có thể reset DB và chạy lại không lỗi.
