import express from 'express';
import { authGuard } from '../utils/guard/auth.guard.js';
import { roleGuard } from '../utils/guard/role.guard.js';
import { asyncHandler } from '../utils/classes/async-handler.js';
import { StudentExamsController } from '../app/controllers/student-exams.controller.js';
import { StudentExamsService } from '../app/services/student-exams.service.js';
import { StudentAttemptsController } from '../app/controllers/student-attempts.controller.js';
import { StudentAttemptsService } from '../app/services/student-attempts.service.js';
import { StudentResultsController } from '../app/controllers/student-results.controller.js';
import { StudentResultsService } from '../app/services/student-results.service.js';

const studentRouter = express.Router();

const studentExamsService = new StudentExamsService();
const studentExamsController = new StudentExamsController(studentExamsService);

const studentAttemptsService = new StudentAttemptsService();
const studentAttemptsController = new StudentAttemptsController(studentAttemptsService);

const studentResultsService = new StudentResultsService();
const studentResultsController = new StudentResultsController(studentResultsService);

studentRouter.use(authGuard, roleGuard(['student']));

// --- Exams Routes ---
/**
 * @openapi
 * /student/exams:
 *   get:
 *     tags: [Student - Exams]
 *     summary: Lay danh sach ky thi co the tham gia
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - {in: query, name: q, schema: {type: string}}
 *       - {in: query, name: page, schema: {type: integer, default: 1}}
 *       - {in: query, name: pageSize, schema: {type: integer, default: 10}}
 *     responses:
 *       200:
 *         description: Danh sach ky thi
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
 */
studentRouter.get('/exams', asyncHandler(studentExamsController.listExams.bind(studentExamsController)));

/**
 * @openapi
 * /student/exams/{examId}:
 *   get:
 *     tags: [Student - Exams]
 *     summary: Lay chi tiet ky thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: {description: Chi tiet ky thi}
 *       404: {description: Khong tim thay ky thi}
 */
studentRouter.get('/exams/:examId', asyncHandler(studentExamsController.getExamDetail.bind(studentExamsController)));

/**
 * @openapi
 * /student/exams/{examId}/attempts:
 *   post:
 *     tags: [Student - Exams]
 *     summary: Bat dau lam bai thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: Bat dau bai lam thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AttemptStarted'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       409: {description: Da co bai lam dang dien ra}
 */
studentRouter.post(
    '/exams/:examId/attempts',
    asyncHandler(studentExamsController.startAttempt.bind(studentExamsController)),
);

// --- Attempts Routes ---
/**
 * @openapi
 * /student/attempts/{attemptId}:
 *   get:
 *     tags: [Student - Attempts]
 *     summary: Lay chi tiet bai lam cua sinh vien
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Chi tiet bai lam
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AttemptDetail'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       404: {description: Khong tim thay bai lam}
 */
studentRouter.get(
    '/attempts/:attemptId',
    asyncHandler(studentAttemptsController.getAttemptDetail.bind(studentAttemptsController)),
);

/**
 * @openapi
 * /student/attempts/{attemptId}/answers/{questionId}:
 *   put:
 *     tags: [Student - Attempts]
 *     summary: Luu dap an cho mot cau hoi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [selectedOptionLabel]
 *             properties:
 *               selectedOptionLabel:
 *                 type: string
 *                 enum: [A, B, C, D]
 *     responses:
 *       200:
 *         description: Luu dap an thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SaveAnswerResponse'
 */
studentRouter.put(
    '/attempts/:attemptId/answers/:questionId',
    asyncHandler(studentAttemptsController.saveAnswer.bind(studentAttemptsController)),
);

/**
 * @openapi
 * /student/attempts/{attemptId}/submit:
 *   post:
 *     tags: [Student - Attempts]
 *     summary: Nop bai thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Nop bai thanh cong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/SubmitResult'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 */
studentRouter.post(
    '/attempts/:attemptId/submit',
    asyncHandler(studentAttemptsController.submitAttempt.bind(studentAttemptsController)),
);

// --- Results Routes ---
/**
 * @openapi
 * /student/results/{resultId}:
 *   get:
 *     tags: [Student - Results]
 *     summary: Lay chi tiet ket qua bai thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: {description: Chi tiet ket qua}
 *       404: {description: Khong tim thay ket qua}
 */
studentRouter.get(
    '/results/:resultId',
    asyncHandler(studentResultsController.getResultDetail.bind(studentResultsController)),
);

/**
 * @openapi
 * /student/results:
 *   get:
 *     tags: [Student - Results]
 *     summary: Lay lich su ket qua bai thi cua sinh vien
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - {in: query, name: page, schema: {type: integer, default: 1}}
 *       - {in: query, name: pageSize, schema: {type: integer, default: 10}}
 *     responses:
 *       200: {description: Danh sach ket qua}
 */
studentRouter.get('/results', asyncHandler(studentResultsController.listResults.bind(studentResultsController)));

export default studentRouter;
