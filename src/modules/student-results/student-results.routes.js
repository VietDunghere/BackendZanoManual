const express = require('express');

const { authGuard } = require('../../shared/guards/auth-guard');
const { roleGuard } = require('../../shared/guards/role-guard');
const { asyncHandler } = require('../../shared/utils/async-handler');
const { StudentResultsController } = require('./student-results.controller');
const { StudentResultsService } = require('./student-results.service');

const studentResultsRouter = express.Router();

const studentResultsService = new StudentResultsService();
const studentResultsController = new StudentResultsController(studentResultsService);

studentResultsRouter.use(authGuard, roleGuard(['student']));

/**
 * @openapi
 * /student/results/{resultId}:
 *   get:
 *     tags:
 *       - Student - Results
 *     summary: Lay chi tiet ket qua
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiet ket qua
 *       403:
 *         description: Khong co quyen truy cap ket qua
 *       404:
 *         description: Khong tim thay ket qua
 */
studentResultsRouter.get(
    '/:resultId',
    asyncHandler(studentResultsController.getResultDetail.bind(studentResultsController)),
);

/**
 * @openapi
 * /student/results:
 *   get:
 *     tags:
 *       - Student - Results
 *     summary: Lay danh sach ket qua cua sinh vien
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: examId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sach ket qua
 */
studentResultsRouter.get('/', asyncHandler(studentResultsController.listResults.bind(studentResultsController)));

module.exports = { studentResultsRouter };
