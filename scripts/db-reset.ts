import mysql from 'mysql2/promise';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Refusing to run db:reset in production mode!');
    process.exit(1);
  }

  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'tiffinghar';

  let connection: mysql.Connection | null = null;
  try {
    console.log(`Connecting to MySQL on ${host}:${port}...`);
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    console.log(`Dropping database \`${database}\` if exists...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${database}\`;`);
    console.log(`✓ Database \`${database}\` dropped.`);
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
      console.error('❌ Error resetting database:', err.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }

  // Now create, migrate, and seed
  console.log('\nRunning db:create...');
  execSync('npx tsx scripts/db-create.ts', { stdio: 'inherit' });

  console.log('\nRunning db:migrate...');
  execSync('npx tsx scripts/db-migrate.ts', { stdio: 'inherit' });

  console.log('\nRunning db:seed...');
  execSync('npx tsx scripts/db-seed.ts', { stdio: 'inherit' });

  console.log('\n✨ Database reset, migrated, and seeded completely!');
}

resetDatabase();
