import express from 'express';
import { authGuard } from '../utils/guard/auth.guard.js';
import { roleGuard } from '../utils/guard/role.guard.js';
import { asyncHandler } from '../utils/classes/async-handler.js';
import { AdminExamsController } from '../app/controllers/admin-exams.controller.js';
import { AdminExamsService } from '../app/services/admin-exams.service.js';
import { AdminQuestionsController } from '../app/controllers/admin-questions.controller.js';
import { AdminQuestionsService } from '../app/services/admin-questions.service.js';
import { AdminStudentsController } from '../app/controllers/admin-students.controller.js';
import { AdminStudentsService } from '../app/services/admin-students.service.js';
import { AdminAttemptsController } from '../app/controllers/admin-attempts.controller.js';
import { AdminAttemptsService } from '../app/services/admin-attempts.service.js';
import { AdminStatsController } from '../app/controllers/admin-stats.controller.js';
import { AdminStatsService } from '../app/services/admin-stats.service.js';

const adminRouter = express.Router();

const adminExamsService = new AdminExamsService();
const adminExamsController = new AdminExamsController(adminExamsService);

const adminQuestionsService = new AdminQuestionsService();
const adminQuestionsController = new AdminQuestionsController(adminQuestionsService);

const adminStudentsService = new AdminStudentsService();
const adminStudentsController = new AdminStudentsController(adminStudentsService);

const adminAttemptsService = new AdminAttemptsService();
const adminAttemptsController = new AdminAttemptsController(adminAttemptsService);

const adminStatsService = new AdminStatsService();
const adminStatsController = new AdminStatsController(adminStatsService);

adminRouter.use(authGuard, roleGuard(['admin']));

// --- Exams Routes ---
/**
 * @openapi
 * /admin/exams:
 *   get:
 *     tags: [Admin - Exams]
 *     summary: Lay danh sach ky thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - {in: query, name: q, schema: {type: string}}
 *       - {in: query, name: status, schema: {type: string, enum: [draft, open, closed]}}
 *       - {in: query, name: page, schema: {type: integer, default: 1}}
 *       - {in: query, name: pageSize, schema: {type: integer, default: 10}}
 *     responses:
 *       200: {description: Danh sach ky thi}
 */
adminRouter.get('/exams', asyncHandler(adminExamsController.listExams.bind(adminExamsController)));

/**
 * @openapi
 * /admin/exams:
 *   post:
 *     tags: [Admin - Exams]
 *     summary: Tao ky thi moi
 *     security: [{BearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, semester, durationMinutes]
 *             properties:
 *               title: {type: string}
 *               description: {type: string}
 *               type: {type: string, enum: [midterm, final, practice]}
 *               semester: {type: string}
 *               durationMinutes: {type: integer}
 *               status: {type: string, enum: [draft, open, closed]}
 *     responses:
 *       201: {description: Tao ky thi thanh cong}
 */
adminRouter.post('/exams', asyncHandler(adminExamsController.createExam.bind(adminExamsController)));

/**
 * @openapi
 * /admin/exams/{examId}:
 *   get:
 *     tags: [Admin - Exams]
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
 *   put:
 *     tags: [Admin - Exams]
 *     summary: Cap nhat ky thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: {type: string}
 *               description: {type: string}
 *               type: {type: string, enum: [midterm, final, practice]}
 *               semester: {type: string}
 *               durationMinutes: {type: integer}
 *               status: {type: string, enum: [draft, open, closed]}
 *     responses:
 *       200: {description: Cap nhat thanh cong}
 *       404: {description: Khong tim thay ky thi}
 *   delete:
 *     tags: [Admin - Exams]
 *     summary: Xoa ky thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: {description: Xoa ky thi thanh cong}
 *       404: {description: Khong tim thay ky thi}
 */
adminRouter.get('/exams/:examId', asyncHandler(adminExamsController.getExamDetail.bind(adminExamsController)));
adminRouter.put('/exams/:examId', asyncHandler(adminExamsController.updateExam.bind(adminExamsController)));
adminRouter.delete('/exams/:examId', asyncHandler(adminExamsController.deleteExam.bind(adminExamsController)));

/**
 * @openapi
 * /admin/exams/{examId}/publish:
 *   post:
 *     tags: [Admin - Exams]
 *     summary: Cong bo de thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: {description: Cong bo ky thi thanh cong}
 *       404: {description: Khong tim thay ky thi}
 */
adminRouter.post('/exams/:examId/publish', asyncHandler(adminExamsController.publishExam.bind(adminExamsController)));

// --- Questions Routes ---
/**
 * @openapi
 * /admin/exams/{examId}/questions/import:
 *   post:
 *     tags: [Admin - Questions]
 *     summary: Import danh sach cau hoi cho ky thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     content: {type: string}
 *                     optionA: {type: string}
 *                     optionB: {type: string}
 *                     optionC: {type: string}
 *                     optionD: {type: string}
 *                     correctOptionLabel: {type: string, enum: [A, B, C, D]}
 *                     orderNo: {type: integer}
 *     responses:
 *       200: {description: Import cau hoi thanh cong}
 */
adminRouter.post(
    '/exams/:examId/questions/import',
    asyncHandler(adminQuestionsController.importQuestions.bind(adminQuestionsController)),
);

/**
 * @openapi
 * /admin/exams/{examId}/questions:
 *   get:
 *     tags: [Admin - Questions]
 *     summary: Lay danh sach cau hoi cua ky thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: integer }
 *       - {in: query, name: q, schema: {type: string}}
 *       - {in: query, name: page, schema: {type: integer, default: 1}}
 *       - {in: query, name: pageSize, schema: {type: integer, default: 10}}
 *     responses:
 *       200: {description: Danh sach cau hoi}
 *   post:
 *     tags: [Admin - Questions]
 *     summary: Tao cau hoi moi trong ky thi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, optionA, optionB, optionC, optionD, correctOptionLabel]
 *             properties:
 *               content: {type: string}
 *               optionA: {type: string}
 *               optionB: {type: string}
 *               optionC: {type: string}
 *               optionD: {type: string}
 *               correctOptionLabel: {type: string, enum: [A, B, C, D]}
 *               orderNo: {type: integer}
 *     responses:
 *       201: {description: Tao cau hoi thanh cong}
 */
adminRouter.get(
    '/exams/:examId/questions',
    asyncHandler(adminQuestionsController.listQuestions.bind(adminQuestionsController)),
);
adminRouter.post(
    '/exams/:examId/questions',
    asyncHandler(adminQuestionsController.createQuestion.bind(adminQuestionsController)),
);

/**
 * @openapi
 * /admin/exams/{examId}/questions/{questionId}:
 *   put:
 *     tags: [Admin - Questions]
 *     summary: Cap nhat cau hoi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: examId
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
 *             properties:
 *               content: {type: string}
 *               optionA: {type: string}
 *               optionB: {type: string}
 *               optionC: {type: string}
 *               optionD: {type: string}
 *               correctOptionLabel: {type: string, enum: [A, B, C, D]}
 *               orderNo: {type: integer}
 *     responses:
 *       200: {description: Cap nhat cau hoi thanh cong}
 *   delete:
 *     tags: [Admin - Questions]
 *     summary: Xoa cau hoi
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: {description: Xoa cau hoi thanh cong}
 */
adminRouter.put(
    '/exams/:examId/questions/:questionId',
    asyncHandler(adminQuestionsController.updateQuestion.bind(adminQuestionsController)),
);
adminRouter.delete(
    '/exams/:examId/questions/:questionId',
    asyncHandler(adminQuestionsController.deleteQuestion.bind(adminQuestionsController)),
);

// --- Students Routes ---
/**
 * @openapi
 * /admin/students:
 *   get:
 *     tags: [Admin - Students]
 *     summary: Lay danh sach sinh vien
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - {in: query, name: q, schema: {type: string}}
 *       - {in: query, name: className, schema: {type: string}}
 *       - {in: query, name: page, schema: {type: integer, default: 1}}
 *       - {in: query, name: pageSize, schema: {type: integer, default: 10}}
 *     responses:
 *       200: {description: Danh sach sinh vien}
 *   post:
 *     tags: [Admin - Students]
 *     summary: Tao tai khoan sinh vien
 *     security: [{BearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, fullName]
 *             properties:
 *               username: {type: string}
 *               password: {type: string}
 *               fullName: {type: string}
 *               email: {type: string, nullable: true}
 *               className: {type: string, nullable: true}
 *     responses:
 *       201: {description: Tao sinh vien thanh cong}
 */
adminRouter.get('/students', asyncHandler(adminStudentsController.listStudents.bind(adminStudentsController)));
adminRouter.post('/students', asyncHandler(adminStudentsController.createStudent.bind(adminStudentsController)));

/**
 * @openapi
 * /admin/students/{studentId}:
 *   put:
 *     tags: [Admin - Students]
 *     summary: Cap nhat thong tin sinh vien
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: {type: string}
 *               email: {type: string, nullable: true}
 *               className: {type: string, nullable: true}
 *               isActive: {type: boolean}
 *     responses:
 *       200: {description: Cap nhat sinh vien thanh cong}
 *   delete:
 *     tags: [Admin - Students]
 *     summary: Xoa sinh vien
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: {description: Xoa sinh vien thanh cong}
 */
adminRouter.put(
    '/students/:studentId',
    asyncHandler(adminStudentsController.updateStudent.bind(adminStudentsController)),
);
adminRouter.delete(
    '/students/:studentId',
    asyncHandler(adminStudentsController.deleteStudent.bind(adminStudentsController)),
);

/**
 * @openapi
 * /admin/students/{studentId}/overview:
 *   get:
 *     tags: [Admin - Students]
 *     summary: Lay tong quan ket qua sinh vien
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: {description: Tong quan ket qua}
 */
adminRouter.get(
    '/students/:studentId/overview',
    asyncHandler(adminStudentsController.getOverview.bind(adminStudentsController)),
);

/**
 * @openapi
 * /admin/students/{studentId}/results:
 *   get:
 *     tags: [Admin - Students]
 *     summary: Lay danh sach ket qua cua sinh vien
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: integer }
 *       - {in: query, name: page, schema: {type: integer, default: 1}}
 *       - {in: query, name: pageSize, schema: {type: integer, default: 10}}
 *     responses:
 *       200: {description: Danh sach ket qua}
 */
adminRouter.get(
    '/students/:studentId/results',
    asyncHandler(adminStudentsController.listResults.bind(adminStudentsController)),
);

/**
 * @openapi
 * /admin/students/{studentId}/report:
 *   get:
 *     tags: [Admin - Students]
 *     summary: Lay bao cao chi tiet cua sinh vien
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: {description: Bao cao sinh vien}
 */
adminRouter.get(
    '/students/:studentId/report',
    asyncHandler(adminStudentsController.getReport.bind(adminStudentsController)),
);

// --- Attempts Routes ---
/**
 * @openapi
 * /admin/attempts/{attemptId}:
 *   get:
 *     tags: [Admin - Attempts]
 *     summary: Lay chi tiet bai lam
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: {description: Chi tiet bai lam}
 *       404: {description: Khong tim thay bai lam}
 */
adminRouter.get(
    '/attempts/:attemptId',
    asyncHandler(adminAttemptsController.getAttemptDetail.bind(adminAttemptsController)),
);

// --- Stats Routes ---
/**
 * @openapi
 * /admin/stats/summary:
 *   get:
 *     tags: [Admin - Stats]
 *     summary: Tong hop thong ke he thong
 *     security: [{BearerAuth: []}]
 *     responses:
 *       200:
 *         description: Du lieu thong ke
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AdminStatsSummary'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 */
adminRouter.get('/stats/summary', asyncHandler(adminStatsController.getSummary.bind(adminStatsController)));

/**
 * @openapi
 * /admin/stats/export:
 *   get:
 *     tags: [Admin - Stats]
 *     summary: Export thong ke
 *     security: [{BearerAuth: []}]
 *     parameters:
 *       - {in: query, name: from, schema: {type: string, format: date}}
 *       - {in: query, name: to, schema: {type: string, format: date}}
 *       - {in: query, name: format, schema: {type: string, enum: [json, csv], default: json}}
 *     responses:
 *       200: {description: Export thanh cong}
 */
adminRouter.get('/stats/export', asyncHandler(adminStatsController.exportStats.bind(adminStatsController)));

export default adminRouter;
