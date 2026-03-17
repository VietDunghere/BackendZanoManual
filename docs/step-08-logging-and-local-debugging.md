# Step 08 - Logging và debug local

## Trạng thái

- Status: Done
- Ngày cập nhật: 2026-03-15
- Mục tiêu: Logging dễ đọc khi dev, JSON chuẩn khi production, gom chung app log + HTTP log

## 0) Thư viện khuyến nghị

- `winston`: logger chính, đa level, format linh hoạt
- `morgan`: HTTP access log middleware cho Express
- `uuid`: tạo traceId/requestId cho request lifecycle (đang dùng ở middleware trace-id)

## 1) Cấu trúc module logging

- `src/shared/logger/logger.js`
    - Khởi tạo logger trung tâm
    - Cấu hình level theo env
    - Chọn format dev/prod
- `src/shared/logger/format.js`
    - Định nghĩa `customLevels` (`error`, `warn`, `info`, `http`, `debug`)
    - Định dạng human-readable cho dev (có màu)
    - Định dạng JSON cho production (không màu)
- `src/shared/logger/http-logger.js`
    - Morgan formatter cho HTTP fields
    - Đẩy log HTTP vào logger chính bằng level `http`
- `src/shared/middleware/error-handler.js`
    - Chống duplicate error log bằng cờ nội bộ `Symbol.for('backendzano.error.logged')`
    - 4xx log `warn`, 5xx log `error`

## 2) Structured logging có requestId/traceId

- Mỗi request sinh requestId hoặc nhận từ header nếu có.
- Log theo format JSON hoặc key-value nhất quán.
- Bắt buộc log:
    - timestamp
    - level
    - requestId/traceId
    - method
    - path
    - statusCode
    - durationMs

## 3) HTTP log bắt buộc fields

- `method`
- `path`
- `status`
- `responseTimeMs`
- `traceId`

## 4) Log an toàn cho endpoint quan trọng

- Log điểm vào/ra cho endpoint critical:
    - auth login/refresh/logout
    - start attempt
    - save answer
    - submit attempt
    - publish exam
    - import question
- Không log dữ liệu nhạy cảm:
    - password
    - full token
    - thông tin PII không cần thiết

## 5) Cơ chế bật/tắt debug log bằng env

- Biến môi trường đề xuất:
    - `NODE_ENV=development|production`
    - `LOG_LEVEL=error|warn|info|http|debug` (optional override)
- Local mặc định:
    - LOG_LEVEL=debug
- Production mặc định:
    - LOG_LEVEL=http (giữ được HTTP log, không bật debug)

## 6) Debug flow chuẩn khi lỗi API

1. Lấy requestId từ response hoặc log middleware.
2. Tìm log theo requestId.
3. Đối chiếu input params/query/body đã sanitize.
4. Đối chiếu service path và repository query tương ứng.
5. Xác định nhóm lỗi:

- validation
- auth/permission
- business rule
- database

6. Ghi lại root cause và cách fix.

## 7) Danh sách lỗi thường gặp và xử lý nhanh

- 401 do token hết hạn:
    - Chạy refresh token rồi gọi lại request.
- 403 do role sai:
    - Kiểm tra token role và route guard.
- 422 do business validation:
    - Kiểm tra trạng thái exam/attempt trước khi submit.
- 500 do query lỗi:
    - Kiểm tra migration/index/schema lệch với code.

## 8) Stack trace format

- Trong dev, stack được tách block riêng:
    - Dòng 1: timestamp + level + service + traceId + message
    - Dòng sau: `Stack:` rồi đến stack nhiều dòng
- Trong production, stack giữ trong field JSON `stack` để tương thích ELK/Loki/Datadog.

## 9) Output mẫu

- Development (human-readable, có màu level):
    - `2026-03-15 16:52:51 INFO backendzano traceId=dev-trace-001 Server is running on port 3000`
    - `2026-03-15 16:52:51 HTTP backendzano traceId=dev-trace-001 GET /api/v1/auth/login 200 12.34ms method=GET path=/api/v1/auth/login status=200 responseTimeMs=12.34`
    - `2026-03-15 16:52:51 ERROR backendzano traceId=dev-trace-003 Unhandled exception code=INTERNAL_SERVER_ERROR status=500`
    - `Stack:`
    - `Error: Boom`

- Production (JSON structured, không màu):
    - `{"timestamp":"2026-03-15T09:52:51.974Z","level":"http","service":"backendzano","message":"GET /api/v1/auth/login 200 12.34ms","traceId":"prod-trace-001","method":"GET","path":"/api/v1/auth/login","status":200,"responseTimeMs":12.34}`

## 10) Debug checklist cho import Excel

- Kiểm tra mime type và extension.
- Kiểm tra mapping cột trong file template.
- Log tổng số dòng parse thành công/thất bại.
- Log rõ dòng nào lỗi và lý do.

## 11) Tiêu chí hoàn tất Step 08

- Có structured logging hoạt động ở mọi request.
- Có requestId/traceId xuyên suốt từ controller đến service.
- Có thể bật/tắt debug log qua env mà không sửa code.
- Không duplicate error log cho cùng một exception.
- Có tài liệu lỗi thường gặp và playbook xử lý nhanh.
- Team có thể debug nhanh dựa trên log khi chạy local.
