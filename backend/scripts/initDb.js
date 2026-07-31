import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from '../db/initDb.js';
import { getDbStatus } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const run = async () => {
  console.log('🚀 Running Database Initialization CLI Script...\n');

  const initialStatus = await getDbStatus();
  console.log('📊 Current Connection Status:', JSON.stringify(initialStatus, null, 2));

  if (initialStatus.mode === 'local_json' && !process.env.DATABASE_URL) {
    console.log('\n⚠️ WARNING: DATABASE_URL is not set in backend/.env!');
    console.log('👉 To create actual tables in PostgreSQL (Neon DB, Supabase, Vercel Postgres, etc.):');
    console.log('   1. Open backend/.env file');
    console.log('   2. Set DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require');
    console.log('   3. Run npm run db:init again.\n');
  }

  console.log('🔨 Creating tables and seeding default records...');
  await initDb();

  const finalStatus = await getDbStatus();
  console.log('\n✅ Database Setup Complete!');
  console.log('📊 Final Database Status:', JSON.stringify(finalStatus, null, 2));
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Database Initialization Failed:', err);
  process.exit(1);
});
