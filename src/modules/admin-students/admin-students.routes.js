const express = require('express');

const { authGuard } = require('../../shared/guards/auth-guard');
const { roleGuard } = require('../../shared/guards/role-guard');
const { asyncHandler } = require('../../shared/utils/async-handler');
const { AdminStudentsController } = require('./admin-students.controller');
const { AdminStudentsService } = require('./admin-students.service');

const adminStudentsRouter = express.Router();

const adminStudentsService = new AdminStudentsService();
const adminStudentsController = new AdminStudentsController(adminStudentsService);

adminStudentsRouter.use(authGuard, roleGuard(['admin']));

/**
 * @openapi
 * /admin/students:
 *   get:
 *     tags:
 *       - Admin - Students
 *     summary: Lay danh sach sinh vien
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
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
 *         description: Danh sach sinh vien
 */
adminStudentsRouter.get('/', asyncHandler(adminStudentsController.listStudents.bind(adminStudentsController)));

/**
 * @openapi
 * /admin/students:
 *   post:
 *     tags:
 *       - Admin - Students
 *     summary: Tao sinh vien moi
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentCode, fullName]
 *             properties:
 *               studentCode:
 *                 type: string
 *               fullName:
 *                 type: string
 *               className:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tao sinh vien thanh cong
 */
adminStudentsRouter.post('/', asyncHandler(adminStudentsController.createStudent.bind(adminStudentsController)));

/**
 * @openapi
 * /admin/students/{studentId}:
 *   put:
 *     tags:
 *       - Admin - Students
 *     summary: Cap nhat thong tin sinh vien
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
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
adminStudentsRouter.put(
    '/:studentId',
    asyncHandler(adminStudentsController.updateStudent.bind(adminStudentsController)),
);

/**
 * @openapi
 * /admin/students/{studentId}:
 *   delete:
 *     tags:
 *       - Admin - Students
 *     summary: Vo hieu hoa tai khoan sinh vien
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vo hieu hoa thanh cong
 */
adminStudentsRouter.delete(
    '/:studentId',
    asyncHandler(adminStudentsController.deleteStudent.bind(adminStudentsController)),
);

/**
 * @openapi
 * /admin/students/{studentId}/overview:
 *   get:
 *     tags:
 *       - Admin - Students
 *     summary: Lay tong quan ket qua sinh vien
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tong quan sinh vien
 */
adminStudentsRouter.get(
    '/:studentId/overview',
    asyncHandler(adminStudentsController.getOverview.bind(adminStudentsController)),
);

/**
 * @openapi
 * /admin/students/{studentId}/results:
 *   get:
 *     tags:
 *       - Admin - Students
 *     summary: Lay danh sach ket qua theo sinh vien
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_progress, submitted, expired]
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
adminStudentsRouter.get(
    '/:studentId/results',
    asyncHandler(adminStudentsController.listResults.bind(adminStudentsController)),
);

/**
 * @openapi
 * /admin/students/{studentId}/report:
 *   get:
 *     tags:
 *       - Admin - Students
 *     summary: Xuat bao cao sinh vien
 *     description: Ban local MVP tra JSON preview cho report.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf]
 *     responses:
 *       200:
 *         description: Du lieu bao cao
 */
adminStudentsRouter.get(
    '/:studentId/report',
    asyncHandler(adminStudentsController.getReport.bind(adminStudentsController)),
);

module.exports = { adminStudentsRouter };
