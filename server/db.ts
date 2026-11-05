import mysql from 'mysql2/promise';

export interface DbConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

let pool: mysql.Pool | null = null;
let currentConfig: DbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'ai_clinic_new',
  ssl: process.env.MYSQL_SSL === 'true',
};

export function getDbConfig(): DbConfig {
  return { ...currentConfig };
}

export function updateDbConfig(newConfig: Partial<DbConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...newConfig,
  };
  if (pool) {
    try {
      pool.end();
    } catch {
      // ignore
    }
    pool = null;
  }
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: currentConfig.host,
      port: currentConfig.port,
      user: currentConfig.user,
      password: currentConfig.password,
      database: currentConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: currentConfig.ssl ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 5000,
    });
  }
  return pool;
}

export async function ensureClinicDataTableExists(): Promise<boolean> {
  const table = process.env.MYSQL_TABLE || 'clinic_data';
  try {
    const currentPool = getPool();
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS \`${table}\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`patient_id\` VARCHAR(64),
        \`patient_name\` VARCHAR(255),
        \`age\` INT,
        \`gender\` VARCHAR(32),
        \`phone\` VARCHAR(64),
        \`email\` VARCHAR(255),
        \`doctor_id\` VARCHAR(64),
        \`doctor_name\` VARCHAR(255),
        \`department\` VARCHAR(128),
        \`appointment_date\` DATE,
        \`appointment_time\` VARCHAR(32),
        \`status\` VARCHAR(64) DEFAULT 'Scheduled',
        \`priority\` VARCHAR(64) DEFAULT 'Normal',
        \`type\` VARCHAR(64) DEFAULT 'In-Person',
        \`room\` VARCHAR(128),
        \`chief_complaint\` TEXT,
        \`disease\` VARCHAR(255),
        \`waiting_time\` INT DEFAULT 0,
        \`consultation_duration\` INT DEFAULT 0,
        \`revenue\` DECIMAL(10,2) DEFAULT 0.00,
        \`notes\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    return true;
  } catch (err: any) {
    console.warn(`[MySQL] Failed to ensure table '${table}' exists:`, err?.message);
    return false;
  }
}

export interface DbHealthStatus {
  connected: boolean;
  database: string;
  table: string;
  host: string;
  port: number;
  user: string;
  totalRows: number;
  columnsCount: number;
  columns: string[];
  error?: string;
  lastChecked: string;
}

export async function checkDatabaseHealth(): Promise<DbHealthStatus> {
  const table = process.env.MYSQL_TABLE || 'clinic_data';
  const status: DbHealthStatus = {
    connected: false,
    database: currentConfig.database || 'ai_clinic_new',
    table,
    host: currentConfig.host || 'localhost',
    port: currentConfig.port || 3306,
    user: currentConfig.user || 'root',
    totalRows: 0,
    columnsCount: 0,
    columns: [],
    lastChecked: new Date().toISOString(),
  };

  try {
    const currentPool = getPool();
    // Test simple ping
    const [pingRes] = await currentPool.query('SELECT 1 as alive');
    if (!pingRes) {
      status.error = 'Failed to receive ping response from MySQL server.';
      return status;
    }

    // Inspect columns of clinic_data
    try {
      let [colRows] = await currentPool.query<mysql.RowDataPacket[]>(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
        [currentConfig.database, table]
      );

      if (colRows.length === 0) {
        await ensureClinicDataTableExists();
        [colRows] = await currentPool.query<mysql.RowDataPacket[]>(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
          [currentConfig.database, table]
        );
      }
      
      const columns = colRows.map((r: any) => r.COLUMN_NAME);
      status.columns = columns;
      status.columnsCount = columns.length;

      // Count rows
      const [countRows] = await currentPool.query<mysql.RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM \`${table}\``
      );
      status.totalRows = Number((countRows as any)[0]?.count || 0);
      status.connected = true;
    } catch (tblErr: any) {
      status.connected = true;
      status.error = `Connected to database '${currentConfig.database}', but table '${table}' could not be read: ${tblErr.message}`;
    }

    return status;
  } catch (err: any) {
    status.connected = false;
    status.error = err.message || 'Unknown database connection error';
    return status;
  }
}
