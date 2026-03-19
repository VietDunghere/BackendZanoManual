import { app } from './index.js';
import { env } from './configs/env.js';
import { logger } from './configs/logger.js'

const server = app.listen(env.APP_PORT, () => {
    logger.info(`Server is running on port ${env.APP_PORT}`);
    console.log(`[manual] API started at http://localhost:${env.APP_PORT}`);
});

server.on('error', (error) => {
    logger.error('Cannot start server', error);
    process.exit(1);
});
