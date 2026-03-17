# Step 06 - Triển khai nghiệp vụ theo module

## Trạng thái
- Status: Done
- Ngày cập nhật: 2026-03-13
- Mục tiêu: Chốt blueprint triển khai nghiệp vụ cốt lõi cho toàn bộ module trong phạm vi local MVP

## 1) Auth module (login, register, refresh, logout)

### Endpoint scope
- POST /api/v1/auth/login
- POST /api/v1/auth/register
- POST /api/v1/auth/refresh-token
- POST /api/v1/auth/logout

### Nghiệp vụ bắt buộc
- Login kiểm tra username + password hash verify.
- Register kiểm tra unique username/email.
- Refresh token trả cặp token mới và revoke token cũ (rotate).
- Logout revoke refresh token đang dùng.

### Edge cases
- Sai password: 401.
- Username đã tồn tại khi register: 409.
- Refresh token không hợp lệ/hết hạn: 401.

## 2) Student Exams module (list exam, detail, start attempt)

### Endpoint scope
- GET /api/v1/student/exams
- GET /api/v1/student/exams/{examId}
- POST /api/v1/student/exams/{examId}/attempts

### Nghiệp vụ bắt buộc
- List exam có filter q/type/status + pagination.
- Detail exam trả metadata cần cho trang exam card.
- Start attempt tạo attempt mới với started_at và expires_at.

### Edge cases
- Exam không tồn tại: 404.
- Exam closed/draft không cho start: 422.

## 3) Student Attempts module (load đề, lưu đáp án, submit)

### Endpoint scope
- GET /api/v1/student/attempts/{attemptId}
- PUT /api/v1/student/attempts/{attemptId}/answers/{questionId}
- POST /api/v1/student/attempts/{attemptId}/submit

### Nghiệp vụ bắt buộc
- Load attempt trả remainingSeconds + questions + selectedOption hiện tại.
- Save answer theo từng question, cho phép cập nhật đè.
- Submit tính điểm, correct_count, total_questions và chốt trạng thái submitted.

### Rule quan trọng
- Chỉ owner của attempt mới được thao tác.
- Không cho save/submit khi attempt expired hoặc đã submitted.
- Submit phải idempotent để tránh nộp trùng.

### Edge cases
- Question không thuộc exam của attempt: 422.
- Submit lần 2: trả kết quả cũ hoặc 409 theo rule đã chọn.

## 4) Student Results module (result detail, result list)

### Endpoint scope
- GET /api/v1/student/results/{resultId}
- GET /api/v1/student/results

### Nghiệp vụ bắt buộc
- Result detail trả score, correct_count, submitted_at.
- Result list hỗ trợ pagination và filter theo exam.

### Edge cases
- User truy cập result không thuộc mình: 403.
- Result không tồn tại: 404.

## 5) Admin Exams module (CRUD + publish)

### Endpoint scope
- GET /api/v1/admin/exams
- POST /api/v1/admin/exams
- GET /api/v1/admin/exams/{examId}
- PUT /api/v1/admin/exams/{examId}
- DELETE /api/v1/admin/exams/{examId}
- POST /api/v1/admin/exams/{examId}/publish

### Nghiệp vụ bắt buộc
- CRUD exam đầy đủ với validate field.
- Delete dùng soft delete.
- Publish chỉ cho exam đủ điều kiện (có question, duration hợp lệ).

### Edge cases
- Publish exam chưa có câu hỏi: 422.
- Update exam đã closed: theo policy (chặn hoặc giới hạn trường sửa).

## 6) Admin Questions module (import + CRUD question)

### Endpoint scope
- POST /api/v1/admin/exams/{examId}/questions/import
- GET /api/v1/admin/exams/{examId}/questions
- POST /api/v1/admin/exams/{examId}/questions
- PUT /api/v1/admin/exams/{examId}/questions/{questionId}
- DELETE /api/v1/admin/exams/{examId}/questions/{questionId}

### Nghiệp vụ bắt buộc
- Import excel parse theo template chuẩn và trả summary import.
- CRUD question bảo toàn order_no.
- Delete question cập nhật lại thứ tự nếu cần.

### Edge cases
- File sai định dạng: 400/422.
- correct_option_label không hợp lệ: 422.

## 7) Admin Students module (CRUD + overview + results + report)

### Endpoint scope
- GET /api/v1/admin/students
- POST /api/v1/admin/students
- PUT /api/v1/admin/students/{studentId}
- DELETE /api/v1/admin/students/{studentId}
- GET /api/v1/admin/students/{studentId}/overview
- GET /api/v1/admin/students/{studentId}/results
- GET /api/v1/admin/students/{studentId}/report

### Nghiệp vụ bắt buộc
- CRUD student với unique studentCode.
- Overview trả profile + totalAttempts + averageScore.
- Results list trả lịch sử thi theo thời gian.
- Report endpoint hỗ trợ xuất PDF ở mức local test.

### Edge cases
- studentCode trùng: 409.
- Xóa student có dữ liệu thi: soft delete + khóa login theo policy.

## 8) Admin Stats module (summary + export)

### Endpoint scope
- GET /api/v1/admin/stats/summary
- GET /api/v1/admin/stats/export

### Nghiệp vụ bắt buộc
- Summary trả totalAttempts, averageScore, completionRate, scoreDistribution.
- Export trả file PDF hoặc payload mô phỏng cho local.

### Edge cases
- Range thời gian không hợp lệ: 422.
- Không có dữ liệu: trả data rỗng, không trả lỗi 500.

## 9) Tiêu chí hoàn tất Step 06
- Tất cả module trên có implementation plan rõ endpoint + business rule.
- Mọi endpoint critical có edge-case định nghĩa rõ.
- Rule permission owner/admin/student nhất quán toàn dự án.
- Có thể chuyển trực tiếp sang bước viết test Postman ở Step 07.
