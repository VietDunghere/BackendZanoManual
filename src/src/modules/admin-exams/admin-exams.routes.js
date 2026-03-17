const express = require('express');

const { authGuard } = require('../../shared/guards/auth-guard');
const { roleGuard } = require('../../shared/guards/role-guard');
const { asyncHandler } = require('../../shared/utils/async-handler');
const { AdminExamsController } = require('./admin-exams.controller');
const { AdminExamsService } = require('./admin-exams.service');

const adminExamsRouter = express.Router();

const adminExamsService = new AdminExamsService();
const adminExamsController = new AdminExamsController(adminExamsService);

adminExamsRouter.use(authGuard, roleGuard(['admin']));

/**
 * @openapi
 * /admin/exams:
 *   get:
 *     tags:
 *       - Admin - Exams
 *     summary: Lay danh sach ky thi
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, open, closed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sach ky thi
 */
adminExamsRouter.get('/', asyncHandler(adminExamsController.listExams.bind(adminExamsController)));

/**
 * @openapi
 * /admin/exams:
 *   post:
 *     tags:
 *       - Admin - Exams
 *     summary: Tao ky thi moi
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, semester, durationMinutes]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [midterm, final, practice]
 *               semester:
 *                 type: string
 *               durationMinutes:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, open, closed]
 *     responses:
 *       201:
 *         description: Tao ky thi thanh cong
 */
adminExamsRouter.post('/', asyncHandler(adminExamsController.createExam.bind(adminExamsController)));

/**
 * @openapi
 * /admin/exams/{examId}:
 *   get:
 *     tags:
 *       - Admin - Exams
 *     summary: Lay chi tiet ky thi
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
 *         description: Chi tiet ky thi
 *       404:
 *         description: Khong tim thay ky thi
 */
adminExamsRouter.get('/:examId', asyncHandler(adminExamsController.getExamDetail.bind(adminExamsController)));

/**
 * @openapi
 * /admin/exams/{examId}:
 *   put:
 *     tags:
 *       - Admin - Exams
 *     summary: Cap nhat ky thi
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
 *             required: [title, type, semester, durationMinutes]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [midterm, final, practice]
 *               semester:
 *                 type: string
 *               durationMinutes:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, open, closed]
 *     responses:
 *       200:
 *         description: Cap nhat thanh cong
 */
adminExamsRouter.put('/:examId', asyncHandler(adminExamsController.updateExam.bind(adminExamsController)));

/**
 * @openapi
 * /admin/exams/{examId}:
 *   delete:
 *     tags:
 *       - Admin - Exams
 *     summary: Xoa mem ky thi
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
 *         description: Xoa thanh cong
 */
adminExamsRouter.delete('/:examId', asyncHandler(adminExamsController.deleteExam.bind(adminExamsController)));

/**
 * @openapi
 * /admin/exams/{examId}/publish:
 *   post:
 *     tags:
 *       - Admin - Exams
 *     summary: Xuat ban ky thi
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
 *         description: Xuat ban thanh cong
 *       422:
 *         description: Ky thi chua du dieu kien xuat ban
 */
adminExamsRouter.post('/:examId/publish', asyncHandler(adminExamsController.publishExam.bind(adminExamsController)));

module.exports = { adminExamsRouter };
