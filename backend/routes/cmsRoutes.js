import express from 'express';
import { query, getDbStatus } from '../config/db.js';
import { initDb } from '../db/initDb.js';

const router = express.Router();

// Helper to parse JSON from DB row
const parseData = (row) => {
  if (!row) return null;
  if (typeof row.data === 'string') {
    try {
      return JSON.parse(row.data);
    } catch {
      return row.data;
    }
  }
  return row.data;
};

// ─── DATABASE DIAGNOSTICS & INITIALIZATION ────────────────────────────────────
router.get('/db-status', async (req, res) => {
  try {
    const status = await getDbStatus();
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/init-db', async (req, res) => {
  try {
    await initDb();
    const status = await getDbStatus();
    res.json({ success: true, message: 'Database initialized successfully', status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET ALL CMS DATA ────────────────────────────────────────────────────────
router.get('/all', async (req, res) => {
  try {
    const contactRes = await query(`SELECT data FROM singletons WHERE key = 'contact_info'`);
    const mapRes = await query(`SELECT data FROM singletons WHERE key = 'map_info'`);
    const bannerRes = await query(`SELECT data FROM singletons WHERE key = 'banner'`);
    const aboutRes = await query(`SELECT data FROM singletons WHERE key = 'about_content'`);
    
    const servicesRes = await query(`SELECT data FROM services ORDER BY created_at DESC`);
    const galleryRes = await query(`SELECT data FROM gallery ORDER BY created_at DESC`);
    const testimonialsRes = await query(`SELECT data FROM testimonials ORDER BY created_at DESC`);
    const estimatesRes = await query(`SELECT data FROM estimates ORDER BY created_at DESC`);
    const leadsRes = await query(`SELECT data FROM leads ORDER BY created_at DESC`);
    const authRes = await query(`SELECT * FROM admin_auth WHERE id = 1`);

    res.json({
      success: true,
      contactInfo: parseData(contactRes.rows[0]),
      mapInfo: parseData(mapRes.rows[0]),
      banner: parseData(bannerRes.rows[0]),
      aboutContent: parseData(aboutRes.rows[0]),
      services: servicesRes.rows.map(r => parseData(r)),
      gallery: galleryRes.rows.map(r => parseData(r)),
      testimonials: testimonialsRes.rows.map(r => parseData(r)),
      estimates: estimatesRes.rows.map(r => parseData(r)),
      contactLeads: leadsRes.rows.map(r => parseData(r)),
      hasAdminAuth: authRes.rows.length > 0
    });
  } catch (err) {
    console.error('Error fetching all CMS data:', err);
    res.status(500).json({ success: false, error: 'Failed to load CMS data from database' });
  }
});

// ─── SINGLETON UPDATES ───────────────────────────────────────────────────────
router.put('/contact', async (req, res) => {
  try {
    const payload = req.body;
    await query(
      `INSERT INTO singletons (key, data, updated_at) VALUES ('contact_info', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(payload)]
    );
    res.json({ success: true, data: payload });
  } catch (err) {
    console.error('Error updating contact info:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/map', async (req, res) => {
  try {
    const payload = req.body;
    await query(
      `INSERT INTO singletons (key, data, updated_at) VALUES ('map_info', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(payload)]
    );
    res.json({ success: true, data: payload });
  } catch (err) {
    console.error('Error updating map info:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/banner', async (req, res) => {
  try {
    const payload = req.body;
    await query(
      `INSERT INTO singletons (key, data, updated_at) VALUES ('banner', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(payload)]
    );
    res.json({ success: true, data: payload });
  } catch (err) {
    console.error('Error updating banner:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/about', async (req, res) => {
  try {
    const payload = req.body;
    await query(
      `INSERT INTO singletons (key, data, updated_at) VALUES ('about_content', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(payload)]
    );
    res.json({ success: true, data: payload });
  } catch (err) {
    console.error('Error updating about content:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── SERVICES CRUD ───────────────────────────────────────────────────────────
router.post('/services', async (req, res) => {
  try {
    const item = req.body;
    const id = item.id || 's_' + Date.now();
    const newItem = { ...item, id };
    await query(`INSERT INTO services (id, data) VALUES ($1, $2)`, [id, JSON.stringify(newItem)]);
    res.json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = { ...req.body, id };
    await query(`UPDATE services SET data = $2 WHERE id = $1`, [id, JSON.stringify(updatedItem)]);
    res.json({ success: true, data: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM services WHERE id = $1`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GALLERY CRUD ────────────────────────────────────────────────────────────
router.post('/gallery', async (req, res) => {
  try {
    const item = req.body;
    const id = item.id || 'g_' + Date.now();
    const newItem = { 
      ...item, 
      id,
      createdAt: item.createdAt || Date.now()
    };
    await query(`INSERT INTO gallery (id, data) VALUES ($1, $2)`, [id, JSON.stringify(newItem)]);
    res.json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = { ...req.body, id };
    await query(`UPDATE gallery SET data = $2 WHERE id = $1`, [id, JSON.stringify(updatedItem)]);
    res.json({ success: true, data: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM gallery WHERE id = $1`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── TESTIMONIALS CRUD ───────────────────────────────────────────────────────
router.post('/testimonials', async (req, res) => {
  try {
    const item = req.body;
    const id = item.id || 't_' + Date.now();
    const newItem = { ...item, id };
    await query(`INSERT INTO testimonials (id, data) VALUES ($1, $2)`, [id, JSON.stringify(newItem)]);
    res.json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = { ...req.body, id };
    await query(`UPDATE testimonials SET data = $2 WHERE id = $1`, [id, JSON.stringify(updatedItem)]);
    res.json({ success: true, data: updatedItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM testimonials WHERE id = $1`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ESTIMATES CRUD ──────────────────────────────────────────────────────────
router.post('/estimates', async (req, res) => {
  try {
    const item = req.body;
    const id = item.id || 'est_' + Date.now();
    const newItem = { ...item, id, createdAt: new Date().toISOString() };
    await query(`INSERT INTO estimates (id, data) VALUES ($1, $2)`, [id, JSON.stringify(newItem)]);
    res.json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM estimates WHERE id = $1`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── CONTACT LEADS CRUD ──────────────────────────────────────────────────────
router.post('/leads', async (req, res) => {
  try {
    const item = req.body;
    const id = item.id || 'lead_' + Date.now();
    const newItem = { ...item, id, createdAt: new Date().toISOString() };
    await query(`INSERT INTO leads (id, data) VALUES ($1, $2)`, [id, JSON.stringify(newItem)]);
    res.json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM leads WHERE id = $1`, [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── AUTHENTICATION ROUTES ───────────────────────────────────────────────────
router.get('/auth/status', async (req, res) => {
  try {
    const authRes = await query(`SELECT * FROM admin_auth WHERE id = 1`);
    res.json({
      success: true,
      hasAdminAuth: authRes.rows.length > 0,
      adminAuth: authRes.rows[0] ? { hash: authRes.rows[0].hash, salt: authRes.rows[0].salt } : null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/auth/setup-password', async (req, res) => {
  try {
    const { hash, salt } = req.body;
    await query(
      `INSERT INTO admin_auth (id, hash, salt, updated_at) VALUES (1, $1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET hash = $1, salt = $2, updated_at = CURRENT_TIMESTAMP`,
      [hash, salt]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
