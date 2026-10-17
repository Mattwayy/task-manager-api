import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reset = async (): Promise<void> => {
  try {
    console.log('🗑️  Dropping all tables...');
    const sql = fs.readFileSync(path.join(__dirname, 'reset.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Tables dropped. Run `npm run migrate` to recreate them.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
};

reset();
