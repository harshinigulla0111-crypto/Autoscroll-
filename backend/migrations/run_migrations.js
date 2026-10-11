const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigrations() {
  if (!db.isConnected()) {
    console.log('ℹ️  PostgreSQL DB not connected. Skipping database migrations.');
    return;
  }

  try {
    const migrationFile = path.join(__dirname, '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    console.log('🔄 Running PostgreSQL database migrations...');
    await db.query(sql);
    console.log('✅ PostgreSQL database schema migrations applied successfully.');
  } catch (err) {
    console.error('⚠️  Migration failed:', err.message);
  }
}

if (require.main === module) {
  runMigrations().then(() => process.exit(0));
}

module.exports = runMigrations;
