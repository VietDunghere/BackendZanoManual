import { pool } from '../../src/configs/database.js';
import { runMigrations } from '../../src/db/migrator.js';

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
