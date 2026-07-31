import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_FILE = path.join(__dirname, '../data/local_db.json');

const { Pool } = pg;
let pool = null;
let useLocalFallback = false;

// In-memory fallback data structure
let localData = {
  singletons: {}, // key -> object JSON
  services: [],
  gallery: [],
  testimonials: [],
  estimates: [],
  leads: [],
  admin_auth: null
};

// Ensure local data dir exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load existing local DB file if exists
if (fs.existsSync(LOCAL_DB_FILE)) {
  try {
    const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
    localData = JSON.parse(raw);
  } catch (err) {
    console.error('Could not parse local DB file, using clean fallback state');
  }
}

const saveLocalData = () => {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(localData, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local DB file:', err);
  }
};

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && databaseUrl.trim() !== '') {
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('🔗 Configured Neon PostgreSQL Pool Connection');
  } catch (err) {
    console.warn('⚠️ Could not initialize Neon Postgres pool. Falling back to local DB storage.');
    useLocalFallback = true;
  }
} else {
  console.log('ℹ️ No DATABASE_URL provided in backend/.env. Running with local persistent DB store.');
  console.log('👉 To connect Neon DB, add your Neon PostgreSQL connection string to backend/.env');
  useLocalFallback = true;
}

export const query = async (text, params = []) => {
  if (!useLocalFallback && pool) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.error('Neon DB Query Error:', err.message);
      throw err;
    }
  } else {
    // Simulated Local SQL execution helper for local development fallback
    return handleLocalQuery(text, params);
  }
};

const handleLocalQuery = (text, params) => {
  const cleanSql = text.trim().replace(/\s+/g, ' ');

  // Create table commands (no-op in fallback mode)
  if (cleanSql.toUpperCase().startsWith('CREATE TABLE')) {
    return { rows: [], rowCount: 0 };
  }

  // Get singleton (contact_info, map_info, banner, about_content)
  if (cleanSql.includes('SELECT data FROM singletons WHERE key =')) {
    const key = params[0];
    const data = localData.singletons[key];
    return { rows: data ? [{ data }] : [] };
  }

  // Insert/Update singleton
  if (cleanSql.includes('INSERT INTO singletons')) {
    const key = params[0];
    const data = params[1];
    localData.singletons[key] = typeof data === 'string' ? JSON.parse(data) : data;
    saveLocalData();
    return { rows: [{ key, data: localData.singletons[key] }], rowCount: 1 };
  }

  // Admin Auth
  if (cleanSql.includes('SELECT * FROM admin_auth')) {
    return { rows: localData.admin_auth ? [localData.admin_auth] : [] };
  }
  if (cleanSql.includes('INSERT INTO admin_auth') || cleanSql.includes('UPDATE admin_auth')) {
    localData.admin_auth = { hash: params[0], salt: params[1] };
    saveLocalData();
    return { rows: [localData.admin_auth], rowCount: 1 };
  }

  // Collection CRUD (services, gallery, testimonials, estimates, leads)
  const collectionMatch = cleanSql.match(/FROM\s+(services|gallery|testimonials|estimates|leads)/i) ||
                          cleanSql.match(/INTO\s+(services|gallery|testimonials|estimates|leads)/i) ||
                          cleanSql.match(/UPDATE\s+(services|gallery|testimonials|estimates|leads)/i) ||
                          cleanSql.match(/DELETE FROM\s+(services|gallery|testimonials|estimates|leads)/i);

  if (collectionMatch) {
    const table = collectionMatch[1].toLowerCase();
    
    if (cleanSql.toUpperCase().startsWith('SELECT')) {
      const items = localData[table] || [];
      return { rows: items.map(item => ({ id: item.id, data: item })) };
    }

    if (cleanSql.toUpperCase().startsWith('INSERT')) {
      const rawItem = params.length > 1 ? params[1] : params[0];
      const item = typeof rawItem === 'string' ? JSON.parse(rawItem) : rawItem;
      localData[table] = [item, ...(localData[table] || [])];
      saveLocalData();
      return { rows: [{ id: item.id, data: item }], rowCount: 1 };
    }

    if (cleanSql.toUpperCase().startsWith('UPDATE')) {
      const id = params[0];
      const rawItem = params.length > 1 ? params[1] : params[0];
      const itemData = typeof rawItem === 'string' ? JSON.parse(rawItem) : rawItem;
      localData[table] = (localData[table] || []).map(item => item.id === id ? { ...item, ...itemData } : item);
      saveLocalData();
      return { rows: [{ id, data: itemData }], rowCount: 1 };
    }

    if (cleanSql.toUpperCase().startsWith('DELETE')) {
      const id = params[0];
      localData[table] = (localData[table] || []).filter(item => item.id !== id);
      saveLocalData();
      return { rows: [], rowCount: 1 };
    }
  }

  return { rows: [], rowCount: 0 };
};

export default {
  query
};
