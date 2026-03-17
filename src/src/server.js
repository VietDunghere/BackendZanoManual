const { app } = require('./app');
const { env } = require('./config/env');
const { logger } = require('./shared/logger/logger');

app.listen(env.APP_PORT, () => {
  logger.info(`Server is running on port ${env.APP_PORT}`);
});
