# Checklist triển khai local (góc nhìn Senior Developer 10+ năm), No mistake

## 1. Chốt phạm vi local MVP
- Tài liệu bước: `docs/step-01-scope-local-mvp.md`
- [x] Xác nhận phạm vi theo frontend hiện có: auth, student exam flow, admin exam, admin student, admin stats.
- [x] Chốt danh sách endpoint theo module từ tài liệu API.
- [x] Chốt Definition of Done cho từng module ở môi trường local.
- [x] Chốt dữ liệu mẫu bắt buộc để demo end-to-end trên máy local.

## 2. Thiết kế kiến trúc backend (local-first)
- Tài liệu bước: `docs/step-02-backend-architecture-local-first.md`
- [x] Chọn kiến trúc monolith modular để triển khai nhanh và dễ debug local.
- [x] Tách module rõ ràng: Auth, Exams, Questions, Attempts, Results, Students, Stats.
- [x] Chuẩn hóa cấu trúc source: controller, service, repository, dto, validator.
- [x] Thiết kế config chỉ cho local: app config, db config, env variables.
- [x] Có file hướng dẫn chạy local 1 lệnh rõ ràng.

## 3. Database và dữ liệu test local
- Tài liệu bước: `docs/step-03-database-and-local-test-data.md`
- [x] Chuẩn hóa schema: users, exams, questions, attempts, answers, results.
- [x] Thiết kế index cho các truy vấn chính (list exam, list results, stats summary).
- [x] Có migration chạy được trên local từ đầu đến cuối.
- [x] Seed dữ liệu local đủ cho cả student và admin test flow.
- [x] Có script reset dữ liệu local để test lại nhiều vòng.

## 4. API contract và quy ước response
- Tài liệu bước: `docs/step-04-api-contract-and-response-conventions.md`
- [x] Chuẩn hóa endpoint naming, status code, pagination/filter.
- [x] Chuẩn hóa request validation ở tất cả endpoint ghi dữ liệu.
- [x] Chuẩn hóa response thành công và response lỗi thống nhất.
- [x] Chốt versioning theo /api/v1.
- [x] Đồng bộ tài liệu API với file mục lục endpoint hiện tại.

## 5. Bảo mật ở mức cần thiết cho local test
- Tài liệu bước: `docs/step-05-security-for-local-testing.md`
- [x] Login dùng JWT access token + refresh token.
- [x] Password hash bằng bcrypt hoặc argon2.
- [x] Bật role-based authorization cho student/admin.
- [x] Chặn dữ liệu input nguy hiểm bằng validation + sanitize cơ bản.
- [x] Kiểm tra upload Excel theo loại file và kích thước.
- [x] Không log password, token đầy đủ, hoặc dữ liệu nhạy cảm.

## 6. Triển khai nghiệp vụ theo module
- Tài liệu bước: `docs/step-06-module-implementation-plan.md`
- [x] Auth module: login, register, refresh, logout.
- [x] Student Exams module: list exam, exam detail, start attempt.
- [x] Student Attempts module: load đề thi, lưu đáp án, submit.
- [x] Student Results module: lấy kết quả vừa nộp và danh sách kết quả.
- [x] Admin Exams module: CRUD exam, publish exam.
- [x] Admin Questions module: import Excel, CRUD question.
- [x] Admin Students module: CRUD student, overview, results, report endpoint.
- [x] Admin Stats module: summary và export endpoint.

## 7. Checklist test bằng Postman
- Tài liệu bước: `docs/step-07-postman-testing-checklist.md`
- [x] Tạo 1 Postman Collection theo module.
- [x] Tạo Postman Environment local (baseUrl, accessToken, refreshToken, ids).
- [x] Viết pre-request script để tự gắn Bearer token khi cần.
- [x] Viết test script cho assert status code, schema cơ bản, field quan trọng.
- [x] Chạy tuần tự luồng student: login -> list exam -> start -> answer -> submit -> result.
- [x] Chạy tuần tự luồng admin: login -> CRUD exam -> import question -> publish -> stats.
- [x] Test case lỗi: unauthorized, forbidden, not found, validation error, duplicate submit.
- [x] Export collection + environment JSON để chia sẻ cho team.

## 8. Logging và debug local
- Tài liệu bước: `docs/step-08-logging-and-local-debugging.md`
- [x] Bật structured logging có requestId/traceId.
- [x] Log rõ input/output ở mức an toàn cho endpoint quan trọng.
- [x] Có cơ chế bật/tắt debug log bằng env local.
- [x] Ghi lại các lỗi thường gặp và cách xử lý nhanh trong tài liệu.

## 9. Tài liệu hóa và bàn giao nội bộ
- [ ] Cập nhật tài liệu setup local: cài dependencies, env, migrate, seed, run.
- [ ] Cập nhật tài liệu API: endpoint, input, output, error mẫu.
- [ ] Cập nhật tài liệu test Postman: thứ tự chạy collection và expected result.
- [ ] Ghi rõ known issues và phạm vi chưa làm trong bản local.

## 10. Checklist hoàn tất bản local
- [ ] Chạy app local thành công không lỗi runtime ở luồng chính.
- [ ] 100% endpoint trong scope có thể gọi được bằng Postman.
- [ ] Tất cả test case critical trong Postman pass.
- [ ] Không còn bug blocker ở các luồng chính.
- [ ] Team khác có thể pull code, setup local và chạy lại theo tài liệu.
