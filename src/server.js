const { app } = require('./app');
const { env } = require('./config/env');
const { logger } = require('./shared/logger/logger');

const server = app.listen(env.APP_PORT, () => {
  logger.info(`Server is running on port ${env.APP_PORT}`);
  console.log(`[manual] API started at http://localhost:${env.APP_PORT}`);
});

server.on('error', (error) => {
  logger.error('Cannot start server', error);
  process.exit(1);
});
