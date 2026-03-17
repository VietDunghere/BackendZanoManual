# Step 07 - Checklist test bằng Postman

## Trạng thái
- Status: Done
- Ngày cập nhật: 2026-03-13
- Mục tiêu: Chuẩn hóa bộ test API local bằng Postman theo module và theo luồng nghiệp vụ

## 1) Cấu trúc Postman Collection
- Collection name: PTIT-EXAM-LOCAL
- Folder theo module:
  - Auth
  - Student Exams
  - Student Attempts
  - Student Results
  - Admin Exams
  - Admin Questions
  - Admin Students
  - Admin Attempts
  - Admin Stats

## 2) Postman Environment local
- Environment name: local
- Biến bắt buộc:
  - baseUrl
  - accessTokenStudent
  - accessTokenAdmin
  - refreshToken
  - examId
  - attemptId
  - questionId
  - studentId
  - resultId
- Quy ước:
  - Dùng biến môi trường cho toàn bộ path param động.
  - Không hard-code ID trong request URL.

## 3) Pre-request script chuẩn
- Nếu endpoint cần auth:
  - Tự động thêm header Authorization Bearer token.
- Nếu token hết hạn:
  - Gọi refresh endpoint lấy token mới.
  - Update lại biến token trong environment.

## 4) Test script chuẩn cho mỗi request
- Assert status code đúng kỳ vọng.
- Assert response có data hoặc error đúng schema tối thiểu.
- Assert field quan trọng tồn tại (id, status, score, pagination).
- Assert endpoint lỗi trả error.code và error.message.

## 5) Luồng test Student end-to-end
1. Login student.
2. List exams.
3. Lấy exam detail.
4. Start attempt.
5. Load attempt data.
6. Save answer nhiều câu.
7. Submit attempt.
8. Lấy result detail.
9. Lấy result list.

## 6) Luồng test Admin end-to-end
1. Login admin.
2. Tạo exam.
3. Thêm câu hỏi thủ công hoặc import excel.
4. Publish exam.
5. Lấy danh sách students.
6. Lấy overview/results của student.
7. Lấy stats summary.
8. Gọi export stats/report.

## 7) Bộ test lỗi bắt buộc
- Unauthorized: không có token.
- Forbidden: student gọi admin endpoint.
- Not found: resource id không tồn tại.
- Validation error: thiếu field bắt buộc.
- Conflict: submit trùng hoặc username/studentCode trùng.
- File upload invalid: sai định dạng hoặc quá size.

## 8) Xuất và bàn giao artifacts
- Export collection JSON.
- Export environment JSON (ẩn secret trước khi chia sẻ).
- Đặt version cho bộ Postman (v1, v2...).
- Lưu vào thư mục docs hoặc thư mục postman của dự án.

## 9) Tiêu chí hoàn tất Step 07
- Có collection theo module đầy đủ.
- Có environment local và script tự động token.
- Chạy pass toàn bộ luồng Student + Admin.
- Chạy pass test lỗi cốt lõi.
- Có file export chia sẻ được cho team.
