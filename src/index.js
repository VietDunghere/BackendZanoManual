import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './configs/swagger.js';
import router from './routers/index.js';
import { requestLogger } from './configs/logger.js';
import { traceIdMiddleware } from './handlers/trace-id.handler.js';
import { notFoundHandler } from './handlers/not-found.handler.js';
import { errorHandler } from './handlers/error.handler.js';
import { sendSuccess } from './utils/helper/response.js';

const app = express();

app.use(helmet());
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

app.use('/api/v1', router);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
