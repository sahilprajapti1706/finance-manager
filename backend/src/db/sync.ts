import { bootstrapDatabase } from './bootstrap';

/**
 * DB Sync utility to manually trigger a database bootstrap/schema sync.
 */
async function sync() {
  try {
    console.log('🔄  Initiating Database Sync...');
    await bootstrapDatabase();
    process.exit(0);
  } catch (err) {
    console.error('❌  Sync process failed:', err);
    process.exit(1);
  }
}

sync();
