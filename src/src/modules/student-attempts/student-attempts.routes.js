const express = require('express');

const { authGuard } = require('../../shared/guards/auth-guard');
const { roleGuard } = require('../../shared/guards/role-guard');
const { asyncHandler } = require('../../shared/utils/async-handler');
const { StudentAttemptsController } = require('./student-attempts.controller');
const { StudentAttemptsService } = require('./student-attempts.service');

const studentAttemptsRouter = express.Router();

const studentAttemptsService = new StudentAttemptsService();
const studentAttemptsController = new StudentAttemptsController(studentAttemptsService);

studentAttemptsRouter.use(authGuard, roleGuard(['student']));

/**
 * @openapi
 * /student/attempts/{attemptId}:
 *   get:
 *     tags:
 *       - Student - Attempts
 *     summary: Xem chi tiết lần làm bài
 *     description: |
 *       Trả về thông tin attempt kèm toàn bộ câu hỏi và đáp án đã chọn.
 *       Chỉ student sở hữu attempt mới được xem.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của attempt
 *     responses:
 *       200:
 *         description: Chi tiết attempt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AttemptDetail'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       400:
 *         description: attemptId không hợp lệ
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
 *         description: Không có quyền (không phải student sở hữu attempt)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy attempt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
studentAttemptsRouter.get('/:attemptId', asyncHandler(studentAttemptsController.getAttemptDetail.bind(studentAttemptsController)));

/**
 * @openapi
 * /student/attempts/{attemptId}/answers/{questionId}:
 *   put:
 *     tags:
 *       - Student - Attempts
 *     summary: Lưu đáp án cho một câu hỏi
 *     description: |
 *       Upsert đáp án của student cho câu hỏi trong attempt.
 *       Yêu cầu:
 *       - Attempt phải ở trạng thái `in_progress` và chưa hết hạn
 *       - Câu hỏi phải thuộc attempt này
 *       - `selectedOptionLabel` phải là một trong: `A`, `B`, `C`, `D`
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của attempt
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của câu hỏi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedOptionLabel
 *             properties:
 *               selectedOptionLabel:
 *                 type: string
 *                 enum: [A, B, C, D]
 *                 example: A
 *     responses:
 *       200:
 *         description: Đáp án được lưu thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaveAnswerResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ (attemptId, questionId hoặc selectedOptionLabel sai)
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
 *         description: Không có quyền truy cập attempt này
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy attempt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Attempt đã nộp, đã hết hạn, hoặc câu hỏi không thuộc attempt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
studentAttemptsRouter.put(
  '/:attemptId/answers/:questionId',
  asyncHandler(studentAttemptsController.saveAnswer.bind(studentAttemptsController))
);

/**
 * @openapi
 * /student/attempts/{attemptId}/submit:
 *   post:
 *     tags:
 *       - Student - Attempts
 *     summary: Nộp bài thi
 *     description: |
 *       Nộp attempt, tính điểm và lưu kết quả.
 *       Yêu cầu:
 *       - Attempt phải ở trạng thái `in_progress` và chưa hết hạn
 *       - Chỉ student sở hữu attempt mới được nộp
 *       - Điểm được tính: `(số câu đúng / tổng câu) * 100`
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của attempt
 *     responses:
 *       200:
 *         description: Nộp bài thành công, trả về kết quả
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/SubmitResult'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       400:
 *         description: attemptId không hợp lệ
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
 *         description: Không có quyền nộp attempt này
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy attempt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Attempt đã nộp rồi hoặc đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
studentAttemptsRouter.post('/:attemptId/submit', asyncHandler(studentAttemptsController.submitAttempt.bind(studentAttemptsController)));

module.exports = { studentAttemptsRouter };
