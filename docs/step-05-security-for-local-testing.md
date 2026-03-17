# Step 05 - Bảo mật ở mức cần thiết cho local test

## Trạng thái
- Status: Done
- Ngày cập nhật: 2026-03-13
- Mục tiêu: Đảm bảo mức an toàn đủ dùng khi chạy local và kiểm thử bằng Postman

## 1) Auth token strategy

### Access token
- Dùng JWT access token cho mọi endpoint cần xác thực.
- Thời gian sống ngắn (khuyến nghị 15 đến 30 phút).
- Gắn trong header Authorization dạng Bearer token.

### Refresh token
- Dùng refresh token để cấp access token mới.
- Refresh token có thời gian sống dài hơn (khuyến nghị 7 ngày cho local test).
- Có cơ chế rotate refresh token khi gọi refresh.

### Logout
- Khi logout, token refresh hiện tại phải bị vô hiệu.
- Nếu có bảng lưu refresh token, đánh dấu revoked.

## 2) Password storage
- Không lưu plaintext password.
- Hash password bằng bcrypt hoặc argon2.
- Có salt đầy đủ theo mặc định thư viện hash.
- So sánh password bằng hàm verify của thư viện, không tự viết.

## 3) Authorization theo role
- Role tối thiểu: student, admin.
- Endpoint dưới /student chỉ cho student.
- Endpoint dưới /admin chỉ cho admin.
- Trả 403 khi user đã login nhưng không đúng role.

## 4) Input validation và sanitize
- Validate params, query, body ở tất cả endpoint ghi dữ liệu.
- Ràng buộc length, enum, required, numeric range.
- Reject payload có field không hợp lệ theo schema.
- Sanitize dữ liệu text để giảm nguy cơ injection cơ bản.

## 5) Bảo mật upload Excel
- Chỉ chấp nhận định dạng xlsx/xls.
- Giới hạn kích thước file upload (ví dụ max 5MB cho local).
- Đổi tên file tạm an toàn khi lưu.
- Không parse file nếu mime/extension không hợp lệ.

## 6) Logging an toàn
- Không log password.
- Không log full access token/refresh token.
- Không log dữ liệu nhạy cảm trong request body.
- Khi cần debug token, chỉ log 4-6 ký tự đầu/cuối.

## 7) Security test checklist bằng Postman
- Login sai password trả 401.
- Gọi endpoint protected không token trả 401.
- Student gọi endpoint admin trả 403.
- Token hết hạn trả 401 và refresh flow hoạt động đúng.
- Upload file sai định dạng trả 400 hoặc 422.
- Payload thiếu field bắt buộc trả 400 hoặc 422.

## 8) Env và secret local
- Secret không hard-code trong source.
- Dùng file .env local, có .env.example để mô tả biến.
- Tách riêng JWT_ACCESS_SECRET và JWT_REFRESH_SECRET.
- Đổi secret khi chia sẻ source cho người khác.

## 9) Tiêu chí hoàn tất Step 05
- Auth chạy đủ login, refresh, logout theo token policy.
- Password đã hash đúng chuẩn.
- Authorization role hoạt động cho toàn bộ route student/admin.
- Validation và upload guard hoạt động ổn định.
- Không còn log chứa thông tin nhạy cảm.
- Các test bảo mật cốt lõi bằng Postman đã pass.
