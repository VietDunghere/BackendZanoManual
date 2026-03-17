# Mục lục API theo module

## Module: Auth
- Login: `POST /api/v1/auth/login`
- Register: `POST /api/v1/auth/register`
- Refresh token: `POST /api/v1/auth/refresh-token`
- Logout: `POST /api/v1/auth/logout`

## Module: Student Exams
- Danh sách kỳ thi: `GET /api/v1/student/exams`
- Chi tiết kỳ thi: `GET /api/v1/student/exams/{examId}`
- Bắt đầu bài thi: `POST /api/v1/student/exams/{examId}/attempts`

## Module: Student Attempts
- Lấy dữ liệu làm bài: `GET /api/v1/student/attempts/{attemptId}`
- Lưu đáp án: `PUT /api/v1/student/attempts/{attemptId}/answers/{questionId}`
- Nộp bài: `POST /api/v1/student/attempts/{attemptId}/submit`

## Module: Student Results
- Kết quả vừa nộp: `GET /api/v1/student/results/{resultId}`
- Danh sách kết quả: `GET /api/v1/student/results`

## Module: Admin Exams
- Danh sách kỳ thi: `GET /api/v1/admin/exams`
- Tạo kỳ thi: `POST /api/v1/admin/exams`
- Chi tiết kỳ thi: `GET /api/v1/admin/exams/{examId}`
- Cập nhật kỳ thi: `PUT /api/v1/admin/exams/{examId}`
- Xóa kỳ thi: `DELETE /api/v1/admin/exams/{examId}`
- Xuất bản kỳ thi: `POST /api/v1/admin/exams/{examId}/publish`

## Module: Admin Questions
- Import Excel: `POST /api/v1/admin/exams/{examId}/questions/import`
- Danh sách câu hỏi: `GET /api/v1/admin/exams/{examId}/questions`
- Thêm câu hỏi: `POST /api/v1/admin/exams/{examId}/questions`
- Cập nhật câu hỏi: `PUT /api/v1/admin/exams/{examId}/questions/{questionId}`
- Xóa câu hỏi: `DELETE /api/v1/admin/exams/{examId}/questions/{questionId}`

## Module: Admin Students
- Danh sách sinh viên: `GET /api/v1/admin/students`
- Thêm sinh viên: `POST /api/v1/admin/students`
- Cập nhật sinh viên: `PUT /api/v1/admin/students/{studentId}`
- Xóa sinh viên: `DELETE /api/v1/admin/students/{studentId}`
- Tổng quan sinh viên: `GET /api/v1/admin/students/{studentId}/overview`
- Kết quả theo sinh viên: `GET /api/v1/admin/students/{studentId}/results`
- Báo cáo sinh viên: `GET /api/v1/admin/students/{studentId}/report`

## Module: Admin Attempts
- Chi tiết bài làm: `GET /api/v1/admin/attempts/{attemptId}`

## Module: Admin Stats
- Thống kê tổng hợp: `GET /api/v1/admin/stats/summary`
- Xuất thống kê PDF: `GET /api/v1/admin/stats/export`
