import { Router } from 'express';
import { authRouter } from './auth.router.js';
import adminRouter from './admin.router.js';
import studentRouter from './student.router.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/student', studentRouter);

export default router;
