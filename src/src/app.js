const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const { env } = require('./config/env');
const { swaggerSpec } = require('./config/swagger');
const { authRouter } = require('./modules/auth/auth.routes');
const { adminStatsRouter } = require('./modules/admin-stats/admin-stats.routes');
const { adminExamsRouter } = require('./modules/admin-exams/admin-exams.routes');
const { adminQuestionsRouter } = require('./modules/admin-questions/admin-questions.routes');
const { adminStudentsRouter } = require('./modules/admin-students/admin-students.routes');
const { adminAttemptsRouter } = require('./modules/admin-attempts/admin-attempts.routes');
const { studentAttemptsRouter } = require('./modules/student-attempts/student-attempts.routes');
const { studentExamsRouter } = require('./modules/student-exams/student-exams.routes');
const { studentResultsRouter } = require('./modules/student-results/student-results.routes');
const { requestLogger } = require('./shared/logger/http-logger');
const { traceIdMiddleware } = require('./shared/middleware/trace-id');
const { notFoundHandler } = require('./shared/middleware/not-found-handler');
const { errorHandler } = require('./shared/middleware/error-handler');
const { sendSuccess } = require('./shared/utils/response');

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(traceIdMiddleware);
app.use(requestLogger);

app.get('/health', (_req, res) => {
    sendSuccess(res, _req, 200, {
        message: 'Backend is healthy',
        timestamp: new Date().toISOString(),
    });
});

app.get('/', (_req, res) => {
    sendSuccess(res, _req, 200, {
        message: 'Welcome to Huzano API',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/student/exams', studentExamsRouter);
app.use('/api/v1/student/attempts', studentAttemptsRouter);
app.use('/api/v1/student/results', studentResultsRouter);
app.use('/api/v1/admin/exams', adminExamsRouter);
app.use('/api/v1/admin', adminQuestionsRouter);
app.use('/api/v1/admin/students', adminStudentsRouter);
app.use('/api/v1/admin/attempts', adminAttemptsRouter);
app.use('/api/v1/admin/stats', adminStatsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
