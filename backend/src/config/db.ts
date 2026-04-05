import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL if available (Neon DB style), or fallback to individual vars
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString 
    ? { 
        connectionString: connectionString.includes('?') 
          ? `${connectionString}&sslmode=verify-full` 
          : `${connectionString}?sslmode=verify-full`,
        ssl: { rejectUnauthorized: false } // Required for most hosted DBs (Neon/Render)
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'finance_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
  process.exit(-1);
});
