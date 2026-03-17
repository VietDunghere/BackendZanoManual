## API implementation status (doi chieu theo docs/api-list.md)

Ngay cap nhat: 2026-03-15

Legend:

- [x] Da implement (route da mount trong app)
- [~] Da co route nhung contract can review
- [ ] Chua implement
- Dau tick `✓` ben canh endpoint = da co Swagger doc

### 1) Auth

- [x] ✓ 1.1 POST /api/v1/auth/login (student)
- [x] ✓ 1.2 POST /api/v1/auth/login (admin)
- [x] ✓ 1.3 POST /api/v1/auth/register
- [x] ✓ 1.4 POST /api/v1/auth/refresh-token
- [x] ✓ 1.5 POST /api/v1/auth/logout

### 2) Student - Ky thi va lam bai

- [x] ✓ 2.1 GET /api/v1/student/exams
- [x] ✓ 2.2 GET /api/v1/student/exams/{examId}
- [x] ✓ 2.3 POST /api/v1/student/exams/{examId}/attempts
- [x] ✓ 2.4 GET /api/v1/student/attempts/{attemptId}
- [x] ✓ 2.5 PUT /api/v1/student/attempts/{attemptId}/answers/{questionId}
      Note: Ho tro ca `selectedOptionId` (frontend) va `selectedOptionLabel` (backward compatibility).
- [x] ✓ 2.6 POST /api/v1/student/attempts/{attemptId}/submit
- [x] ✓ 2.7 GET /api/v1/student/results/{resultId}
- [x] ✓ 2.8 GET /api/v1/student/results

### 3) Admin - Quan ly ky thi

- [x] ✓ 3.1 GET /api/v1/admin/exams
- [x] ✓ 3.2 POST /api/v1/admin/exams
- [x] ✓ 3.3 GET /api/v1/admin/exams/{examId}
- [x] ✓ 3.4 PUT /api/v1/admin/exams/{examId}
- [x] ✓ 3.5 DELETE /api/v1/admin/exams/{examId}
- [~] ✓ 3.6 POST /api/v1/admin/exams/{examId}/questions/import
  Note: Ban local MVP nhan `application/json` (truong `questions`) thay cho parse multipart excel.
- [x] ✓ 3.7 GET /api/v1/admin/exams/{examId}/questions
- [x] ✓ 3.8 POST /api/v1/admin/exams/{examId}/questions
- [x] ✓ 3.9 PUT /api/v1/admin/exams/{examId}/questions/{questionId}
- [x] ✓ 3.10 DELETE /api/v1/admin/exams/{examId}/questions/{questionId}
- [x] ✓ 3.11 POST /api/v1/admin/exams/{examId}/publish

### 4) Admin - Quan ly sinh vien

- [x] ✓ 4.1 GET /api/v1/admin/students
- [x] ✓ 4.2 POST /api/v1/admin/students
- [x] ✓ 4.3 PUT /api/v1/admin/students/{studentId}
- [x] ✓ 4.4 DELETE /api/v1/admin/students/{studentId}
- [x] ✓ 4.5 GET /api/v1/admin/students/{studentId}/overview
- [x] ✓ 4.6 GET /api/v1/admin/students/{studentId}/results
- [x] ✓ 4.7 GET /api/v1/admin/attempts/{attemptId}
- [x] ✓ 4.8 GET /api/v1/admin/students/{studentId}/report

### 5) Admin - Thong ke

- [x] ✓ 5.1 GET /api/v1/admin/stats/summary
- [x] ✓ 5.2 GET /api/v1/admin/stats/export

### 6) Error response convention

- [x] Middleware dang tra format loi theo `error.code`, `error.message`, `error.details`, kem `meta.traceId`.

### 7) Ghi chu nhanh de implement tiep

- Da tao route files va mount cho cac module con thieu.
- Da implement controller/service/repository cho admin + student-results.
- Con viec tiep theo uu tien cao: bo sung import excel thuc su (multipart + xlsx) cho endpoint 3.6.
