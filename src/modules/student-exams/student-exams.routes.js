const express = require('express');

const { authGuard } = require('../../shared/guards/auth-guard');
const { roleGuard } = require('../../shared/guards/role-guard');
const { asyncHandler } = require('../../shared/utils/async-handler');
const { StudentExamsController } = require('./student-exams.controller');
const { StudentExamsService } = require('./student-exams.service');

const studentExamsRouter = express.Router();

const studentExamsService = new StudentExamsService();
const studentExamsController = new StudentExamsController(studentExamsService);

studentExamsRouter.use(authGuard, roleGuard(['student']));

/**
 * @openapi
 * /student/exams:
 *   get:
 *     tags:
 *       - Student - Exams
 *     summary: Lấy danh sách đề thi
 *     description: Trả về danh sách đề thi có phân trang. Chỉ student được truy cập.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang (bắt đầu từ 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Số bản ghi mỗi trang (tối đa 50)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề đề thi
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [midterm, final, practice]
 *         description: Lọc theo loại đề thi
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed]
 *         description: Lọc theo trạng thái đề thi
 *     responses:
 *       200:
 *         description: Danh sách đề thi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExamItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       400:
 *         description: Query param không hợp lệ (type hoặc status sai enum)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Không có quyền (không phải student)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
studentExamsRouter.get('/', asyncHandler(studentExamsController.listExams.bind(studentExamsController)));

/**
 * @openapi
 * /student/exams/{examId}:
 *   get:
 *     tags:
 *       - Student - Exams
 *     summary: Lay chi tiet de thi
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiet de thi
 *       400:
 *         description: examId khong hop le
 *       401:
 *         description: Chua xac thuc
 *       403:
 *         description: Khong co quyen
 *       404:
 *         description: Khong tim thay de thi
 */
studentExamsRouter.get('/:examId', asyncHandler(studentExamsController.getExamDetail.bind(studentExamsController)));

/**
 * @openapi
 * /student/exams/{examId}/attempts:
 *   post:
 *     tags:
 *       - Student - Exams
 *     summary: Bắt đầu làm bài thi
 *     description: |
 *       Tạo một attempt mới cho đề thi. Yêu cầu:
 *       - Đề thi phải ở trạng thái `open`
 *       - Student chưa có attempt `in_progress` cho đề thi này
 *       - Đề thi phải có ít nhất một câu hỏi
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của đề thi
 *     responses:
 *       201:
 *         description: Attempt được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AttemptStarted'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       400:
 *         description: examId không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Không có quyền (không phải student)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy đề thi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Đã có attempt đang tiến hành cho đề thi này
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Đề thi chưa mở hoặc không có câu hỏi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
studentExamsRouter.post(
    '/:examId/attempts',
    asyncHandler(studentExamsController.startAttempt.bind(studentExamsController)),
);

module.exports = { studentExamsRouter };
