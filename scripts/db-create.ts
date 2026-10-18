import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'tiffinghar';

  console.log(`Connecting to MySQL on ${host}:${port} as ${user}...`);

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    console.log(`Creating database \`${dbName}\` if not exists...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );

    console.log(`✅ Database \`${dbName}\` is ready on WAMP MySQL.`);
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
      console.error('❌ Error creating database:', err.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createDatabase();
