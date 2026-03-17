# Danh sách API theo frontend đã thiết kế

## 1) Auth

### 1.1 Đăng nhập sinh viên
- Method: `POST`
- Endpoint: `/api/v1/auth/login`
- Request body:
```json
{
  "username": "B20DCCN001",
  "password": "string",
  "role": "student"
}
```
- Response 200:
```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "user": {
    "id": "u_001",
    "username": "B20DCCN001",
    "fullName": "Nguyen Van A",
    "role": "student"
  }
}
```

### 1.2 Đăng nhập admin/giảng viên
- Method: `POST`
- Endpoint: `/api/v1/auth/login`
- Request body:
```json
{
  "username": "admin01",
  "password": "string",
  "role": "admin"
}
```
- Response: giống 1.1, `role = admin`

### 1.3 Đăng ký tài khoản
- Method: `POST`
- Endpoint: `/api/v1/auth/register`
- Request body:
```json
{
  "fullName": "string",
  "email": "string",
  "username": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

### 1.4 Làm mới token
- Method: `POST`
- Endpoint: `/api/v1/auth/refresh-token`

### 1.5 Đăng xuất
- Method: `POST`
- Endpoint: `/api/v1/auth/logout`

## 2) Student - Kỳ thi và làm bài

### 2.1 Lấy danh sách kỳ thi của sinh viên
- Method: `GET`
- Endpoint: `/api/v1/student/exams`
- Query:
  - `q` (search)
  - `type` (all/midterm/final/practice)
  - `status` (open/closed)
  - `page`, `pageSize`
- Response 200:
```json
{
  "items": [
    {
      "examId": "ex_001",
      "title": "Co so du lieu",
      "subtitle": "Giua ky - Ki 1 2023",
      "durationMinutes": 60,
      "questionCount": 40,
      "teacherName": "Nguyen Van A",
      "status": "open"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1
  }
}
```

### 2.2 Lấy chi tiết kỳ thi
- Method: `GET`
- Endpoint: `/api/v1/student/exams/{examId}`

### 2.3 Bắt đầu bài thi
- Method: `POST`
- Endpoint: `/api/v1/student/exams/{examId}/attempts`
- Request body (optional):
```json
{
  "deviceInfo": "web"
}
```
- Response 201:
```json
{
  "attemptId": "at_001",
  "startedAt": "2026-03-13T08:30:00Z",
  "expiresAt": "2026-03-13T09:30:00Z"
}
```

### 2.4 Lấy dữ liệu làm bài (câu hỏi + đồng hồ + trạng thái)
- Method: `GET`
- Endpoint: `/api/v1/student/attempts/{attemptId}`
- Response 200:
```json
{
  "attemptId": "at_001",
  "exam": {
    "examId": "ex_001",
    "title": "Co so du lieu"
  },
  "student": {
    "studentCode": "B20DCCN001"
  },
  "remainingSeconds": 2700,
  "questions": [
    {
      "questionId": "q_001",
      "index": 1,
      "content": "Cau lenh SQL nao dung de truy xuat du lieu?",
      "options": [
        {"optionId": "o_a", "label": "A", "content": "EXTRACT"},
        {"optionId": "o_b", "label": "B", "content": "SELECT"}
      ],
      "selectedOptionId": "o_b"
    }
  ]
}
```

### 2.5 Lưu đáp án 1 câu (autosave)
- Method: `PUT`
- Endpoint: `/api/v1/student/attempts/{attemptId}/answers/{questionId}`
- Request body:
```json
{
  "selectedOptionId": "o_b"
}
```

### 2.6 Nộp bài
- Method: `POST`
- Endpoint: `/api/v1/student/attempts/{attemptId}/submit`
- Response 200:
```json
{
  "resultId": "rs_001",
  "score": 8.5,
  "correctCount": 34,
  "totalQuestions": 40,
  "submittedAt": "2026-03-13T09:10:00Z"
}
```

### 2.7 Xem kết quả vừa nộp
- Method: `GET`
- Endpoint: `/api/v1/student/results/{resultId}`

### 2.8 Danh sách kết quả của sinh viên (nếu mở rộng menu "Kết quả thi")
- Method: `GET`
- Endpoint: `/api/v1/student/results`
- Query: `page`, `pageSize`, `examId`

## 3) Admin - Quản lý kỳ thi

### 3.1 Danh sách kỳ thi
- Method: `GET`
- Endpoint: `/api/v1/admin/exams`
- Query: `q`, `status`, `page`, `pageSize`

### 3.2 Tạo kỳ thi mới
- Method: `POST`
- Endpoint: `/api/v1/admin/exams`
- Request body:
```json
{
  "title": "string",
  "description": "string",
  "type": "midterm",
  "semester": "2023-1",
  "durationMinutes": 60,
  "status": "draft"
}
```

### 3.3 Lấy chi tiết kỳ thi để sửa
- Method: `GET`
- Endpoint: `/api/v1/admin/exams/{examId}`

### 3.4 Cập nhật kỳ thi
- Method: `PUT`
- Endpoint: `/api/v1/admin/exams/{examId}`

### 3.5 Xóa kỳ thi
- Method: `DELETE`
- Endpoint: `/api/v1/admin/exams/{examId}`

### 3.6 Upload câu hỏi bằng Excel
- Method: `POST`
- Endpoint: `/api/v1/admin/exams/{examId}/questions/import`
- Content-Type: `multipart/form-data`
- Form data:
  - `file`: `.xlsx/.xls`

### 3.7 Lấy danh sách câu hỏi của kỳ thi
- Method: `GET`
- Endpoint: `/api/v1/admin/exams/{examId}/questions`

### 3.8 Thêm 1 câu hỏi thủ công
- Method: `POST`
- Endpoint: `/api/v1/admin/exams/{examId}/questions`
- Request body:
```json
{
  "content": "string",
  "options": [
    {"label": "A", "content": "string"},
    {"label": "B", "content": "string"}
  ],
  "correctOptionLabel": "B"
}
```

### 3.9 Cập nhật câu hỏi
- Method: `PUT`
- Endpoint: `/api/v1/admin/exams/{examId}/questions/{questionId}`

### 3.10 Xóa câu hỏi
- Method: `DELETE`
- Endpoint: `/api/v1/admin/exams/{examId}/questions/{questionId}`

### 3.11 Xuất bản kỳ thi
- Method: `POST`
- Endpoint: `/api/v1/admin/exams/{examId}/publish`

## 4) Admin - Quản lý sinh viên

### 4.1 Danh sách sinh viên
- Method: `GET`
- Endpoint: `/api/v1/admin/students`
- Query: `q`, `page`, `pageSize`

### 4.2 Thêm sinh viên
- Method: `POST`
- Endpoint: `/api/v1/admin/students`
- Request body:
```json
{
  "studentCode": "B20DCCN001",
  "fullName": "Nguyen Van A",
  "className": "D20CQCN01-B",
  "email": "string"
}
```

### 4.3 Cập nhật sinh viên
- Method: `PUT`
- Endpoint: `/api/v1/admin/students/{studentId}`

### 4.4 Xóa sinh viên
- Method: `DELETE`
- Endpoint: `/api/v1/admin/students/{studentId}`

### 4.5 Hồ sơ + tổng quan kết quả 1 sinh viên
- Method: `GET`
- Endpoint: `/api/v1/admin/students/{studentId}/overview`
- Response gồm: profile, class, totalAttempts, averageScore

### 4.6 Danh sách kết quả theo sinh viên
- Method: `GET`
- Endpoint: `/api/v1/admin/students/{studentId}/results`
- Query: `q`, `status`, `page`, `pageSize`

### 4.7 Chi tiết bài làm theo attempt/result
- Method: `GET`
- Endpoint: `/api/v1/admin/attempts/{attemptId}`

### 4.8 In/xuất báo cáo sinh viên
- Method: `GET`
- Endpoint: `/api/v1/admin/students/{studentId}/report`
- Query: `format=pdf`

## 5) Admin - Thống kê

### 5.1 Dashboard thống kê tổng hợp
- Method: `GET`
- Endpoint: `/api/v1/admin/stats/summary`
- Response gồm:
  - `totalAttempts`
  - `averageScore`
  - `completionRate`
  - `scoreDistribution` (mảng bins cho biểu đồ cột)

### 5.2 Xuất báo cáo thống kê PDF
- Method: `GET`
- Endpoint: `/api/v1/admin/stats/export`
- Query: `format=pdf`, `from`, `to`, `examId` (optional)

## 6) Chuẩn response lỗi (đề xuất chung)

- HTTP 400/401/403/404/409/422/500
- Response:
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
  }
}
```

## 7) Mapping nhanh frontend -> API

- Đăng nhập/Đăng ký: `index.html`, `admin-login.html` -> nhóm Auth
- Danh sách kỳ thi sinh viên: `dashboard.html` -> 2.1, 2.2
- Làm bài thi: `exam.html` -> 2.3, 2.4, 2.5, 2.6
- Kết quả: `result.html` -> 2.7
- Admin quản lý kỳ thi: `admin-dashboard.html`, `admin-exam-edit.html` -> nhóm 3
- Admin quản lý sinh viên: `admin-users.html`, `admin-user-result.html` -> nhóm 4
- Admin thống kê: `admin-stats.html` -> nhóm 5
