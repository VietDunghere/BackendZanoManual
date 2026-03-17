# Step 02 - Thiết kế kiến trúc backend (local-first)

## Trạng thái
- Status: Done
- Ngày cập nhật: 2026-03-13
- Phạm vi: Chốt kiến trúc cho triển khai local + test bằng Postman

## 1) Quyết định kiến trúc
- Chọn kiến trúc: Monolith modular.
- Lý do:
  - Scope hiện tại vừa phải, chưa cần overhead microservice.
  - Dễ chạy local, debug nhanh, setup đơn giản.
  - Dễ tách module theo domain và vẫn mở rộng được sau này.

## 2) Module backend chuẩn hóa
- Auth Module
- Student Exams Module
- Student Attempts Module
- Student Results Module
- Admin Exams Module
- Admin Questions Module
- Admin Students Module
- Admin Attempts Module
- Admin Stats Module

## 3) Boundary và nguyên tắc phụ thuộc
- Controller chỉ gọi service trong cùng module.
- Service chỉ truy cập dữ liệu qua repository.
- Không cho module gọi trực tiếp repository của module khác.
- Truy cập chéo module bắt buộc qua service contract rõ ràng.
- DTO tách riêng request/response, không expose entity trực tiếp ra API.

## 4) Cấu trúc source đề xuất
```text
src/
  modules/
    auth/
      auth.controller
      auth.service
      auth.repository
      dto/
      validators/
    student-exams/
    student-attempts/
    student-results/
    admin-exams/
    admin-questions/
    admin-students/
    admin-attempts/
    admin-stats/
  shared/
    middleware/
    guards/
    errors/
    logger/
    utils/
  config/
    env/
      .env.example
```

## 5) Chiến lược config local
- Chỉ dùng môi trường local (`.env`).
- Biến môi trường tối thiểu:
  - `APP_PORT`
  - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
  - `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`
  - `CORS_ORIGIN`
- Có `.env.example` để onboarding nhanh.

## 6) Tiêu chuẩn chạy local 1 lệnh
- Mục tiêu:
  - Dev mới clone repo có thể chạy backend local bằng 1 lệnh chính.
- Đề xuất:
  - Cài dependencies.
  - Migrate database.
  - Seed dữ liệu local.
  - Start server.
- Tài liệu setup chi tiết sẽ hoàn thiện ở Step 10.

## 7) Out-of-scope của Step 02
- Chưa triển khai CI/CD pipeline.
- Chưa tách deployment theo môi trường server.
- Chưa tối ưu hạ tầng production.
