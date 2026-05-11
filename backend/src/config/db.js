const sql = require('mssql');

// mssql connection config — values come from .env file
const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    // encrypt: true is REQUIRED for Azure SQL connections
    encrypt: true,
    // trustServerCertificate: true lets local dev skip SSL cert validation.
    // Azure always has a valid cert so this should be false in production.
    trustServerCertificate: process.env.NODE_ENV === 'development',
    enableArithAbort: true
  }
};

// Reuse one connection pool across the app (don't open a new connection per request)
let pool;

const getPool = async () => {
  if (pool && pool.connected) {
    return pool;
  }
  if (pool && !pool.connected) {
    try { await pool.close(); } catch (_) {}
    pool = null;
  }
  pool = await sql.connect(config);
  console.log('Connected to SQL Server');
  pool.on('error', (err) => {
    console.error('SQL pool error:', err.message);
    pool = null;
  });
  return pool;
};

module.exports = { getPool, sql };
