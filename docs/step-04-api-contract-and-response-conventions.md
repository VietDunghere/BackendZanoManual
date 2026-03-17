# Step 04 - API contract và quy ước response

## Trạng thái
- Status: Done
- Ngày cập nhật: 2026-03-13
- Mục tiêu: Chuẩn hóa contract API để code local đồng nhất và test Postman dễ tự động hóa

## 1) Endpoint naming conventions

### Versioning
- Prefix bắt buộc: `/api/v1`

### Resource naming
- Dùng danh từ số nhiều, chữ thường, phân tách bằng dấu gạch ngang khi cần.
- Dùng path parameter cho resource cụ thể.
- Không đưa động từ vào endpoint nếu có thể dùng HTTP method diễn đạt hành vi.

### Mẫu chuẩn theo dự án
- Auth: `/api/v1/auth/...`
- Student: `/api/v1/student/exams`, `/api/v1/student/attempts`, `/api/v1/student/results`
- Admin: `/api/v1/admin/exams`, `/api/v1/admin/students`, `/api/v1/admin/stats`

### Query conventions
- Pagination: `page`, `pageSize`
- Search: `q`
- Filter enum: `status`, `type`
- Sort (nếu bổ sung): `sortBy`, `sortOrder`

## 2) HTTP status code conventions

### Thành công
- `200 OK`: lấy dữ liệu, cập nhật thành công.
- `201 Created`: tạo mới thành công.
- `204 No Content`: xóa thành công không cần body.

### Lỗi nghiệp vụ/kỹ thuật
- `400 Bad Request`: request sai format hoặc thiếu field cơ bản.
- `401 Unauthorized`: thiếu token hoặc token invalid/expired.
- `403 Forbidden`: đúng token nhưng không đủ quyền.
- `404 Not Found`: resource không tồn tại.
- `409 Conflict`: xung đột dữ liệu (username trùng, submit trùng).
- `422 Unprocessable Entity`: validation nghiệp vụ thất bại.
- `500 Internal Server Error`: lỗi không mong muốn từ server.

## 3) Request validation conventions

### Validation bắt buộc
- Validate đầy đủ body, params, query ở controller boundary.
- Enum field phải kiểm tra whitelist (`role`, `status`, `type`).
- ID path param phải đúng format hệ thống chọn (uuid/number/string-id).
- Pagination có default an toàn: `page=1`, `pageSize=10`, giới hạn `pageSize` max.

### Validation theo domain
- Auth:
  - username/password bắt buộc khi login.
  - password policy tối thiểu cho register.
- Attempts:
  - không cho submit khi attempt đã submitted/expired.
  - answer chỉ nhận option hợp lệ của câu hỏi.
- Admin import:
  - file extension và file size bắt buộc đúng rule.

## 4) Response success chuẩn thống nhất

### Dạng trả về object
```json
{
  "data": {
    "id": "..."
  },
  "meta": {
    "traceId": "..."
  }
}
```

### Dạng trả về danh sách
```json
{
  "data": [
    {
      "id": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  },
  "meta": {
    "traceId": "..."
  }
}
```

## 5) Error response chuẩn thống nhất

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Du lieu khong hop le",
    "details": [
      {
        "field": "username",
        "issue": "required"
      }
    ]
  },
  "meta": {
    "traceId": "..."
  }
}
```

### Error code đề xuất
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `BUSINESS_RULE_VIOLATION`
- `INTERNAL_SERVER_ERROR`

## 6) Đồng bộ tài liệu API hiện tại
- Tài liệu endpoint chi tiết: `docs/api-list.md`
- Tài liệu endpoint rút gọn theo module: `docs/api-toc.md`
- Quy ước trong Step 04 là chuẩn để cập nhật ngược lại vào 2 tài liệu trên khi có thay đổi.

## 7) Tiêu chí hoàn tất Step 04
- Toàn bộ endpoint trong scope theo chuẩn `/api/v1`.
- Có quy tắc rõ cho status code theo từng loại tình huống.
- Có validation rule chuẩn áp cho params/query/body.
- Có mẫu response success/error thống nhất dùng chung toàn dự án.
- Tài liệu endpoint hiện có được tham chiếu và đồng bộ logic với quy ước mới.
