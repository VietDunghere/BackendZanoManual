const express = require('express');

const { authGuard } = require('../../shared/guards/auth-guard');
const { roleGuard } = require('../../shared/guards/role-guard');
const { asyncHandler } = require('../../shared/utils/async-handler');
const { AdminQuestionsController } = require('./admin-questions.controller');
const { AdminQuestionsService } = require('./admin-questions.service');

const adminQuestionsRouter = express.Router();

const adminQuestionsService = new AdminQuestionsService();
const adminQuestionsController = new AdminQuestionsController(adminQuestionsService);

adminQuestionsRouter.use(authGuard, roleGuard(['admin']));

/**
 * @openapi
 * /admin/exams/{examId}/questions/import:
 *   post:
 *     tags:
 *       - Admin - Questions
 *     summary: Import cau hoi vao ky thi
 *     description: Ban local MVP nhan payload JSON co truong `questions`.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: Import thanh cong
 */
adminQuestionsRouter.post(
    '/exams/:examId/questions/import',
    asyncHandler(adminQuestionsController.importQuestions.bind(adminQuestionsController)),
);

/**
 * @openapi
 * /admin/exams/{examId}/questions:
 *   get:
 *     tags:
 *       - Admin - Questions
 *     summary: Lay danh sach cau hoi cua ky thi
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
 *         description: Danh sach cau hoi
 */
adminQuestionsRouter.get(
    '/exams/:examId/questions',
    asyncHandler(adminQuestionsController.listQuestions.bind(adminQuestionsController)),
);

/**
 * @openapi
 * /admin/exams/{examId}/questions:
 *   post:
 *     tags:
 *       - Admin - Questions
 *     summary: Tao cau hoi moi
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, options, correctOptionLabel]
 *             properties:
 *               content:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       enum: [A, B, C, D]
 *                     content:
 *                       type: string
 *               correctOptionLabel:
 *                 type: string
 *                 enum: [A, B, C, D]
 *     responses:
 *       201:
 *         description: Tao cau hoi thanh cong
 */
adminQuestionsRouter.post(
    '/exams/:examId/questions',
    asyncHandler(adminQuestionsController.createQuestion.bind(adminQuestionsController)),
);

/**
 * @openapi
 * /admin/exams/{examId}/questions/{questionId}:
 *   put:
 *     tags:
 *       - Admin - Questions
 *     summary: Cap nhat cau hoi
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cap nhat thanh cong
 */
adminQuestionsRouter.put(
    '/exams/:examId/questions/:questionId',
    asyncHandler(adminQuestionsController.updateQuestion.bind(adminQuestionsController)),
);

/**
 * @openapi
 * /admin/exams/{examId}/questions/{questionId}:
 *   delete:
 *     tags:
 *       - Admin - Questions
 *     summary: Xoa mem cau hoi
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xoa thanh cong
 */
adminQuestionsRouter.delete(
    '/exams/:examId/questions/:questionId',
    asyncHandler(adminQuestionsController.deleteQuestion.bind(adminQuestionsController)),
);

module.exports = { adminQuestionsRouter };
