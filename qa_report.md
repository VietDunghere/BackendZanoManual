# Tech Lead & QA Review Report

**Reviewer:** Tech Lead / QA
**Date:** 2026-03-15
**Subject:** Audit session report của Senior Dev (GitHub Copilot)

---

## I. ĐÁNH GIÁ TỔNG QUAN

**Verdict: PASS WITH CONDITIONS** — Codebase có nền tảng tốt, nhưng có một số issues phải fix trước khi merge vào main.

Senior dev đã hoàn thành đúng scope được giao: route + controller + service + repository cho tất cả các module còn thiếu. Convention được giữ nhất quán. Tuy nhiên qua code review thực tế (không chỉ đọc report), phát hiện một số vấn đề mà report **không đề cập**.

---

## II. NHỮNG GÌ ĐÃ LÀM ĐÚNG ✅

- **Parameterized queries** 100% — không có SQL injection risk
- **Auth + Role guard** được apply đúng trên tất cả routes
- **Soft delete** (`deleted_at`, `is_active`) nhất quán
- **Ownership check** trên student-results (student chỉ xem kết quả của mình)
- **Business rule publish**: exam phải có ít nhất 1 câu hỏi — đúng
- **Transaction** được dùng trong question import — đúng
- **DOS mitigation** pagination: `pageSize` capped at 50 — đúng
- **Completion rate** xử lý divide-by-zero — đúng

---

## III. ISSUES PHÁT HIỆN

### 🔴 HIGH — Phải fix

**[H-1] Route collision trong `src/app.js`**
- `adminExamsRouter` và `adminQuestionsRouter` cùng mount trên `/api/v1/admin/exams`
- Hiện tại vô tình hoạt động do `/:examId/questions/*` không overlap, nhưng là anti-pattern nguy hiểm khi mở rộng

**[H-2] Không có rate limiting trên auth endpoints**
- `/auth/login` có thể bị brute-force không giới hạn
- Report không đề cập điểm này

**[H-3] Student password = username (`src/modules/admin-students/admin-students.service.js`)**
```js
const passwordHash = await bcrypt.hash(value.username, 10); // studentCode làm password
```
- Không có flow buộc đổi password lần đầu login
- Không có endpoint change password cho student

**[H-4] Question import không có array size limit (`src/modules/admin-questions/admin-questions.service.js`)**
- Payload `{ questions: [...] }` không giới hạn số phần tử → memory exhaustion / DoS

---

### 🟡 MEDIUM — Nên fix trong sprint này

**[M-1] Email validation quá yếu (`src/modules/admin-students/admin-students.service.js`)**
```js
if (email && !email.includes('@')) { ... } // chấp nhận "@@", "@domain", "user@"
```

**[M-2] Date validation thiếu trong stats export (`src/modules/admin-stats/admin-stats.service.js`)**
- `from`/`to` nhận `Number()` trực tiếp từ query string, không validate format

**[M-3] Pagination DoS qua page number lớn**
- `page=999999999` vẫn chạy `OFFSET` query tốn kém, dù `pageSize` đã cap 50

**[M-4] Admin access không có audit log**
- Admin xem attempt của bất kỳ student nào (`/admin/attempts/:attemptId`) mà không để lại trace

---

### 🔵 LOW — Technical debt

**[L-1] Error message lẫn tiếng Việt và tiếng Anh** — nên thống nhất một ngôn ngữ

**[L-2] Soft delete student trả về `"deleted": true`** — nhưng thực ra là `is_active = 0`, gây nhầm lẫn

**[L-3] Không có Postman regression suite** — senior dev cũng thừa nhận trong report mục 7

---

## IV. ĐÁNH GIÁ SO VỚI REPORT CỦA SENIOR

| Điểm senior báo cáo | Thực tế |
|---|---|
| "Không có lỗi syntax" | ✅ Đúng |
| "Đã validate input ở boundary" | ⚠️ Thiếu: email, date, array size |
| "Kiểm tra ownership" | ✅ Đúng cho student-results, nhưng admin-attempts không log |
| "Soft delete" nhất quán | ✅ Đúng |
| Hạn chế Excel import (MVP) | ✅ Trung thực, đã ghi nhận đúng |
| Hạn chế PDF real stream (MVP) | ✅ Trung thực, đã ghi nhận đúng |

**Điểm trừ:** Senior dev **không tự phát hiện** H-1 (route collision) và H-2 (no rate limiting) — đây là 2 vấn đề quan trọng.

---

## V. ACTION ITEMS

| Priority | Task | Owner |
|---|---|---|
| 🔴 | Fix route mounting collision trong app.js | Senior Dev |
| 🔴 | Thêm max array size cho question import | Senior Dev |
| 🔴 | Add rate limiting middleware cho /auth/* | Senior Dev |
| 🔴 | Thiết kế flow initial password cho student | Tech Lead quyết định |
| 🟡 | Upgrade email validation | Senior Dev |
| 🟡 | Validate date format ở stats export | Senior Dev |
| 🟡 | Cap max page number ở pagination | Senior Dev |
| 🔵 | Viết Postman regression suite | Senior Dev (step 7) |
| 🔵 | Thống nhất error message language | Backlog |

---

**Kết luận:** Scope giao đã hoàn thành. Chất lượng code cơ bản là tốt. Cần fix 4 items HIGH trước khi release. Senior dev cần chú ý hơn ở security surface (rate limiting, input size limits) trong các task tương lai.

---

## VI. HOTFIX FOLLOW-UP REVIEW (2026-03-15)

Senior dev đã submit hotfix cho toàn bộ 8 action items HIGH + MEDIUM. Đã verify trực tiếp từ code.

### Kết quả verify

| ID | Claim | Verdict | Ghi chú |
|---|---|---|---|
| H-1 | Route collision fixed: `adminQuestionsRouter` chuyển sang `/api/v1/admin` | ✅ CONFIRMED | `app.js:50` mount đúng; routes trong file định nghĩa `/exams/:examId/questions/...` — logic đúng |
| H-2 | Rate limiting middleware mới tại `src/shared/middleware/rate-limit.js` | ✅ CONFIRMED | Custom in-memory sliding window. `/login` giới hạn 10/min, các endpoint auth khác 30/min |
| H-3 | `createStudent` tạo `temporaryPassword` random, trả về `mustChangePassword: true` | ✅ CONFIRMED | Dùng `crypto.randomBytes`, charset đủ mạnh (upper/lower/digit/special), 12 ký tự, bcrypt rounds=10 |
| H-4 | `maxImportItems = 200` trong question import | ✅ CONFIRMED | Throw `VALIDATION_ERROR` nếu array rỗng hoặc vượt 200 |
| M-1 | Nâng cấp email validation lên regex | ✅ CONFIRMED | Pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — đủ dùng cho MVP |
| M-2 | Validate datetime `from`/`to` + range check | ✅ CONFIRMED | `parseIsoDateTime()` validate format; range check `from > to` khi cả 2 đều có giá trị |
| M-3 | Cap `maxPage = 10_000` trên các service có pagination | ✅ CONFIRMED | Nhất quán ở `admin-exams`, `student-results`, `student-exams` |
| M-4 | Audit log khi admin xem attempt detail | ✅ CONFIRMED | `logger.info('Admin viewed attempt detail', { traceId, adminUserId, attemptId })` |

### Observations sau hotfix

**Tốt:**
- `temporaryPassword` dùng `crypto.randomBytes` — đúng cách, không dùng `Math.random()`
- Rate limiter tự viết — functional, không phụ thuộc thư viện ngoài

**Còn mở (chấp nhận được ở giai đoạn này):**
- **H-3:** `mustChangePassword: true` được trả về nhưng **chưa có endpoint `/change-password`** và **chưa enforce** ở middleware — senior dev đã ghi nhận, đang chờ Tech Lead chốt schema. Cần track riêng.
- **M-1:** Regex email đơn giản, không bắt được một số edge case (ví dụ: `"user"@domain.com`, IP literal). Chấp nhận cho MVP, cần upgrade nếu mở rộng.
- **M-2:** Range validation chỉ chạy khi **cả hai** `from` và `to` đều có mặt — nếu chỉ truyền `to` mà không có `from`, không validate range. Không phải bug nguy hiểm nhưng nên note.

### Verdict hotfix round

**PASS** — Tất cả 8 issues đã được address đúng như mô tả. Không có discrepancy giữa report và code thực tế.

**Remaining open items (chuyển sang backlog):**
- Enforce `mustChangePassword` ở middleware — chờ Tech Lead quyết định schema/endpoint
- Postman regression suite
- Thống nhất error message language (vẫn còn `'Du lieu khong hop le'` tiếng Việt trong code)
