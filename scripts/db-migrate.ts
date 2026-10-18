import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

async function runMigrations() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'tiffinghar';

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
    });

    console.log(`Checking schema_migrations table in ${database}...`);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [rows] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT name FROM schema_migrations'
    );
    const appliedMigrations = new Set(rows.map((r) => r.name));

    const migrationsDir = path.join(process.cwd(), 'database', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No database/migrations directory found.');
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    let appliedCount = 0;
    for (const file of files) {
      if (appliedMigrations.has(file)) {
        continue;
      }

      console.log(`Running migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await connection.query(sql);
      await connection.query(
        'INSERT INTO schema_migrations (name) VALUES (?)',
        [file]
      );
      console.log(`  ✓ Successfully applied: ${file}`);
      appliedCount++;
    }

    if (appliedCount === 0) {
      console.log('✅ All migrations are already up to date.');
    } else {
      console.log(`✅ Successfully applied ${appliedCount} migration(s).`);
    }
  } catch (err: any) {
    if (
      err.code === 'ECONNREFUSED' ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'ENOTFOUND'
    ) {
      console.error(
        '\n❌ [Database Connection Error]: MySQL is not reachable.\n👉 Start WAMP and make sure the icon is green, then check DB_* values in .env.\n'
      );
    } else {
      console.error('❌ Migration failed:', err.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();
