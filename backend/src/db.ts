import pkg from 'pg';
import type { Pool as PgPool } from 'pg';
const { Pool } = pkg;

const pool: PgPool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tasks_db',
});

export default pool;
