import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

/**
 * Executes the PostgreSQL schema definition against the connected database.
 * Reads the schema from src/db/init.sql to allow for standard SQL editing.
 * Uses IF NOT EXISTS guards so it is safe to call on every server startup.
 */
export async function bootstrapDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    // Resolve path to the init.sql file relative to this file
    const schemaPath = path.resolve(__dirname, 'init.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️  Database schema file not found at:', schemaPath);
      return;
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Use an advisory lock to prevent concurrent schema updates from multiple processes
    // '999999' is a custom lock ID for this operation.
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(999999)');
    
    // Execute the full schema string
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log('✅  Database bootstrapped successfully from init.sql');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌  Failed to bootstrap database:', err);
    throw err;
  } finally {
    client.release();
  }
}
