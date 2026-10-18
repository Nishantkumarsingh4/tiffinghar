import mysql from 'mysql2/promise';

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

export function getDbConfig(): DbConfig {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tiffinghar',
  };
}

let pool: mysql.Pool | null = null;

export function getPool(customDbName?: string): mysql.Pool {
  const config = getDbConfig();
  const dbName = customDbName !== undefined ? customDbName : config.database;

  if (pool && !customDbName) {
    return pool;
  }

  const newPool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: dbName || undefined,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    dateStrings: true,
  });

  if (!customDbName) {
    pool = newPool;
  }
  return newPool;
}

export function handleDbError(err: any): never {
  const code = err?.code || '';
  if (
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    code === 'PROTOCOL_CONNECTION_LOST'
  ) {
    console.error(
      '\n❌ [Database Connection Error]: MySQL is not reachable.\n👉 Start WAMP and make sure the icon is green, then check DB_* values in .env.\n'
    );
  } else if (code === 'ER_ACCESS_DENIED_ERROR') {
    console.error(
      '\n❌ [Database Auth Error]: Access denied for user.\n👉 Check DB_USER and DB_PASSWORD in .env.\n'
    );
  }
  throw err;
}

/**
 * Execute a parameterized SELECT query returning an array of rows
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const currentPool = getPool();
    const [rows] = await currentPool.execute(sql, params);
    return rows as T[];
  } catch (err) {
    handleDbError(err);
  }
}

/**
 * Execute a parameterized SELECT query returning the first matching row or null
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute a parameterized INSERT / UPDATE / DELETE query returning ResultSetHeader
 */
export async function execute(sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> {
  try {
    const currentPool = getPool();
    const [result] = await currentPool.execute(sql, params);
    return result as mysql.ResultSetHeader;
  } catch (err) {
    handleDbError(err);
  }
}

/**
 * Run operations within a transaction
 */
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const currentPool = getPool();
  const connection = await currentPool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    handleDbError(err);
  } finally {
    connection.release();
  }
}

export default {
  query,
  queryOne,
  execute,
  transaction,
  getPool,
  getDbConfig,
};
