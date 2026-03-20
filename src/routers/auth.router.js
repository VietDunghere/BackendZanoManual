import express from 'express';
import { asyncHandler } from '../utils/classes/async-handler.js';
import { createRateLimiter } from '../handlers/rate-limit.handler.js';
import { AuthController } from '../app/controllers/auth.controller.js';
import { AuthService } from '../app/services/auth.service.js';

const authRouter = express.Router();

const authService = new AuthService();
const authController = new AuthController(authService);

const authLoginRateLimiter = createRateLimiter({
    windowMs: 60_000,
    max: 10,
    errorMessage: 'Too many login attempts, please try again later',
});

const authDefaultRateLimiter = createRateLimiter({
    windowMs: 60_000,
    max: 30,
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng ký tài khoản mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - fullName
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 4
 *                 maxLength: 50
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: secret1234
 *               fullName:
 *                 type: string
 *                 maxLength: 150
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 example: john@example.com
 *               role:
 *                 type: string
 *                 enum: [admin, student]
 *                 default: student
 *               className:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 example: CS01
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Username hoặc email đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/register', authDefaultRateLimiter, asyncHandler(authController.register.bind(authController)));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 example: secret1234
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Sai username hoặc password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Tài khoản bị vô hiệu hóa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/login', authLoginRateLimiter, asyncHandler(authController.login.bind(authController)));

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Làm mới access token bằng refresh token
 *     description: Thực hiện token rotation — refresh token cũ bị thu hồi, trả về cặp token mới.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token mới được cấp thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Refresh token không hợp lệ, hết hạn hoặc đã bị thu hồi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post(
    '/refresh-token',
    authDefaultRateLimiter,
    asyncHandler(authController.refreshToken.bind(authController)),
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng xuất (thu hồi refresh token)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     loggedOut:
 *                       type: boolean
 *                       example: true
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/logout', authDefaultRateLimiter, asyncHandler(authController.logout.bind(authController)));

export { authRouter };
