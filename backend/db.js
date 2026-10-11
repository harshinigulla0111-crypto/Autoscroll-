const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configure PostgreSQL connection pool from environment variables
const isCloudServerless = Boolean(process.env.VERCEL);
const hasExplicitDbConfig = Boolean(process.env.DATABASE_URL || process.env.DB_HOST);

const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 3000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'autoscroll_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

let pool = null;
let isDbConnected = false;

// Only attempt DB connection if explicitly configured or running in local dev
if (hasExplicitDbConfig || !isCloudServerless) {
  try {
    pool = new Pool(poolConfig);

    // Test pool connection quietly
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.log('ℹ️  PostgreSQL DB offline or not configured. Application running with local state fallback.');
        isDbConnected = false;
      } else {
        console.log('✅ Connected to PostgreSQL database successfully.');
        isDbConnected = true;
      }
    });
  } catch (err) {
    console.log('ℹ️ PostgreSQL initialization note:', err.message);
    isDbConnected = false;
  }
} else {
  console.log('ℹ️  Cloud serverless deployment active without DB credentials. Application running with state fallback.');
  isDbConnected = false;
}

/**
 * Execute parameterized SQL query safely
 */
async function query(text, params = []) {
  if (!pool || !isDbConnected) {
    return { rows: [], rowCount: 0, isFallback: true };
  }

  try {
    const res = await pool.query(text, params);
    return { ...res, isFallback: false };
  } catch (err) {
    console.error('Database Query Error:', err.message);
    throw err;
  }
}

/**
 * Check if Database connection is alive
 */
function isConnected() {
  return isDbConnected;
}

module.exports = {
  pool,
  query,
  isConnected
};
