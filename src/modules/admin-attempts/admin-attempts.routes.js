const express = require('express');

const { authGuard } = require('../../shared/guards/auth-guard');
const { roleGuard } = require('../../shared/guards/role-guard');
const { asyncHandler } = require('../../shared/utils/async-handler');
const { AdminAttemptsController } = require('./admin-attempts.controller');
const { AdminAttemptsService } = require('./admin-attempts.service');

const adminAttemptsRouter = express.Router();

const adminAttemptsService = new AdminAttemptsService();
const adminAttemptsController = new AdminAttemptsController(adminAttemptsService);

adminAttemptsRouter.use(authGuard, roleGuard(['admin']));

/**
 * @openapi
 * /admin/attempts/{attemptId}:
 *   get:
 *     tags:
 *       - Admin - Attempts
 *     summary: Lay chi tiet bai lam theo attempt
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiet attempt
 *       404:
 *         description: Khong tim thay attempt
 */
adminAttemptsRouter.get(
    '/:attemptId',
    asyncHandler(adminAttemptsController.getAttemptDetail.bind(adminAttemptsController)),
);

module.exports = { adminAttemptsRouter };
