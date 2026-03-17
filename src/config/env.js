const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Manual mode: allow local defaults so setup is easier when cloning project.
const maybeMissing = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
].filter((key) => !process.env[key]);

if (maybeMissing.length > 0) {
  console.warn('[env] some variables are missing, using fallback values:', maybeMissing.join(', '));
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_PORT: Number(process.env.APP_PORT || 5000),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_NAME: process.env.DB_NAME || 'backendzano',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

module.exports = { env };
