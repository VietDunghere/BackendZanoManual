const { pool } = require('../../src/config/database');
const { runMigrations } = require('../../src/database/migrator');

async function main() {
  const connection = await pool.getConnection();

  try {
    await runMigrations(connection);
    console.log('[migrate] done');
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch(async (error) => {
  console.error('[migrate] failed:', error);
  await pool.end();
  process.exit(1);
});
