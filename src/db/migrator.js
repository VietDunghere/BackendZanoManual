import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureMigrationTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
}

async function loadMigrationFiles(migrationsDir) {
  const files = await fs.readdir(migrationsDir);
  return files
    .filter((file) => file.endsWith('.js'))
    .sort();
}

async function getAppliedMigrations(connection) {
  const [rows] = await connection.query('SELECT name FROM schema_migrations ORDER BY name ASC');
  return new Set(rows.map((row) => row.name));
}

export async function runMigrations(connection) {
  const migrationsDir = path.resolve(__dirname, 'migrations');

  await ensureMigrationTable(connection);

  const files = await loadMigrationFiles(migrationsDir);
  const applied = await getAppliedMigrations(connection);

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const migrationPath = path.join(migrationsDir, file);
    const migration = await import(migrationPath);

    if (typeof migration.up !== 'function') {
      throw new Error(`Migration ${file} is invalid: missing up() function`);
    }

    await connection.beginTransaction();
    try {
      await migration.up(connection);
      await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      await connection.commit();
      console.log(`[migrate] applied ${file}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }
}
