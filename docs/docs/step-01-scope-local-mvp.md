# Step 01 - Chốt phạm vi local MVP

## Trạng thái
- Status: Done
- Ngày cập nhật: 2026-03-13
- Người thực hiện: Senior checklist owner

## 1) Phạm vi local MVP đã chốt

### Module trong phạm vi
- Auth
- Student Exams
- Student Attempts
- Student Results
- Admin Exams
- Admin Questions
- Admin Students
- Admin Attempts
- Admin Stats

### Luồng người dùng trong phạm vi
- Student: login -> xem danh sách kỳ thi -> bắt đầu thi -> lưu đáp án -> nộp bài -> xem kết quả.
- Admin: login -> CRUD kỳ thi -> import câu hỏi -> publish kỳ thi -> CRUD sinh viên -> xem kết quả -> xem stats.

## 2) Endpoint theo module đã chốt
- Nguồn endpoint chi tiết: `docs/api-toc.md`
- Nguồn endpoint đầy đủ request/response: `docs/api-list.md`

## 3) Definition of Done (DoD) cho local MVP
- Mỗi endpoint trong scope gọi được trên local bằng Postman.
- Endpoint đúng method, path, auth rule, status code.
- Request invalid trả lỗi đúng format.
- Luồng Student end-to-end chạy được bằng dữ liệu seed.
- Luồng Admin end-to-end chạy được bằng dữ liệu seed.
- Không còn bug blocker ở luồng chính.

## 4) Dữ liệu mẫu local bắt buộc

### Tài khoản
- 1 admin account: `admin01`.
- Tối thiểu 2 student account: `B20DCCN001`, `B20DCCN002`.

### Dữ liệu kỳ thi
- Tối thiểu 2 kỳ thi open, 1 kỳ thi closed.
- Mỗi kỳ thi có tối thiểu 10 câu hỏi trắc nghiệm hợp lệ.

### Dữ liệu attempt/result
- Tối thiểu 1 attempt đã nộp của mỗi student để test result và stats.
- Tối thiểu 1 attempt chưa nộp để test edge case submit/timeout.

## 5) Ràng buộc ngoài phạm vi Step 01
- Chưa triển khai CI/CD server.
- Chưa tối ưu production monitoring.
- Chưa benchmark hiệu năng chuyên sâu.
