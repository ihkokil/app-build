import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;
let isInitialized = false;
let lastHealthCheck: {
  result: {
    connected: boolean;
    host: string;
    port: number;
    database: string;
    latencyMs?: number;
    error?: string | null;
    tableReady: boolean;
  };
  timestamp: number;
} | null = null;

const HEALTH_CACHE_TTL_MS = 25000; // 25s circuit breaker cache

export function getDbConfig() {
  let host = process.env.DB_HOST || 'localhost';
  if (host === 'srv992.hstgr.io' || host === '193.203.166.225') {
    host = '2a02:4780:b:1234::174';
  }
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'todo_db';
  const useSsl = process.env.DB_SSL === 'true';

  return {
    host,
    port,
    user,
    password,
    database,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: 0,
    connectTimeout: 3000,
  };
}

export function getPool(): mysql.Pool {
  if (!pool) {
    const config = getDbConfig();
    pool = mysql.createPool(config);
  }
  return pool;
}

export async function checkDbHealth(force = false): Promise<{
  connected: boolean;
  host: string;
  port: number;
  database: string;
  latencyMs?: number;
  error?: string | null;
  tableReady: boolean;
}> {
  const config = getDbConfig();
  const now = Date.now();

  if (!force && lastHealthCheck && now - lastHealthCheck.timestamp < HEALTH_CACHE_TTL_MS) {
    return lastHealthCheck.result;
  }

  const startTime = Date.now();

  try {
    const testPool = getPool();
    const connection = await testPool.getConnection();
    const latencyMs = Date.now() - startTime;

    let tableReady = false;
    try {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        "SHOW TABLES LIKE 'todos'"
      );
      tableReady = rows.length > 0;
      if (!tableReady) {
        await initDatabaseWithConnection(connection);
        tableReady = true;
      }
    } finally {
      connection.release();
    }

    const result = {
      connected: true,
      host: config.host,
      port: config.port,
      database: config.database,
      latencyMs,
      tableReady,
      error: null,
    };

    lastHealthCheck = { result, timestamp: now };
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const result = {
      connected: false,
      host: config.host,
      port: config.port,
      database: config.database,
      tableReady: false,
      error: message,
    };

    lastHealthCheck = { result, timestamp: now };
    return result;
  }
}

async function initDatabaseWithConnection(connection: mysql.PoolConnection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
      category VARCHAR(50) NOT NULL DEFAULT 'General',
      due_date DATETIME NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      completed_at DATETIME NULL,
      subtasks JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_todos_status (completed),
      INDEX idx_todos_priority (priority),
      INDEX idx_todos_category (category),
      INDEX idx_todos_due_date (due_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

export async function isDbAvailable(): Promise<boolean> {
  const health = await checkDbHealth(false);
  return health.connected;
}

export async function initDatabase(): Promise<boolean> {
  if (isInitialized) return true;
  const available = await isDbAvailable();
  if (!available) return false;

  try {
    const p = getPool();
    const connection = await p.getConnection();
    try {
      await initDatabaseWithConnection(connection);
      isInitialized = true;
      return true;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.warn('MySQL initDatabase skipped or failed (fallback active):', err);
    return false;
  }
}
