import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { query, getDbStatus } from '../config/db.js';
import { initDb } from '../db/initDb.js';
import { isCloudinaryConfigured, uploadStreamToCloudinary } from '../config/cloudinary.js';
import { requireAdminAuth, verifyPassword, generateAdminToken } from '../utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Memory storage for multer (supports streaming to DB or Cloud)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB maximum
  }
});

// Dedicated multer instance for public customer review photos (strictly 1MB max)
const reviewUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024 // 1MB maximum
  }
});

// In-memory IP rate limiter for public review photo uploads (max 10 uploads per 15 min per IP)
const reviewUploadLimitMap = new Map();
const REVIEW_UPLOAD_WINDOW_MS = 15 * 60 * 1000;
const REVIEW_UPLOAD_MAX = 10;

const checkReviewUploadRateLimit = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const record = reviewUploadLimitMap.get(ip) || { count: 0, resetTime: now + REVIEW_UPLOAD_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + REVIEW_UPLOAD_WINDOW_MS;
  }

  if (record.count >= REVIEW_UPLOAD_MAX) {
    return res.status(429).json({
      success: false,
      error: 'Upload limit reached for review photos. Please try again in 15 minutes.'
    });
  }

  record.count += 1;
  reviewUploadLimitMap.set(ip, record);
  next();
};

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

// ─── MEDIA UPLOADS & PERSISTENT STORAGE (CLOUDINARY + NEON DB) ──────────────

// Authenticated Admin Upload (15MB images, 30MB videos)
router.post('/upload', requireAdminAuth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File size exceeds 30MB limit.' });
      }
      return res.status(400).json({ success: false, error: err.message || 'Error processing file upload' });
    }
    next();
  });
}, async (req, res) => {
  try {
    let fileBuffer = null;
    let filename = '';
    let mimeType = '';
    let size = 0;

    if (req.file) {
      fileBuffer = req.file.buffer;
      filename = req.file.originalname || 'upload';
      mimeType = req.file.mimetype || 'application/octet-stream';
      size = req.file.size;
    } else if (req.body && (req.body.fileData || req.body.data)) {
      const raw = req.body.fileData || req.body.data;
      filename = req.body.filename || 'upload';
      mimeType = req.body.mimeType || 'application/octet-stream';

      if (raw.includes(';base64,')) {
        const parts = raw.split(';base64,');
        mimeType = parts[0].replace('data:', '') || mimeType;
        fileBuffer = Buffer.from(parts[1], 'base64');
      } else {
        fileBuffer = Buffer.from(raw, 'base64');
      }
      size = fileBuffer.length;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // MIME type validation
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ];
    if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Unsupported file type: "${mimeType}". Allowed: JPG, PNG, WEBP, GIF, SVG, and MP4/WEBM videos.`
      });
    }

    // Size validation
    const isVideo = mimeType.startsWith('video/');
    const maxBytes = isVideo ? 30 * 1024 * 1024 : 15 * 1024 * 1024;
    if (size > maxBytes) {
      return res.status(400).json({
        success: false,
        error: `File is too large (${(size / (1024 * 1024)).toFixed(1)}MB). Max allowed is ${isVideo ? '30MB' : '15MB'}.`
      });
    }

    // Generate unique ID & filename
    const mediaId = 'med_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const ext = path.extname(filename) || (isVideo ? '.mp4' : '.jpg');
    const safeFilename = `${mediaId}${ext}`;

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;

    let publicUrl = '';
    let publicId = null;
    const resourceType = isVideo ? 'video' : 'image';

    if (isCloudinaryConfigured()) {
      // Upload directly to Cloudinary CDN via memory stream
      const cldResult = await uploadStreamToCloudinary(fileBuffer, {
        folder: 'munnalal_painter/gallery',
        resource_type: resourceType
      });
      publicUrl = cldResult.secure_url || cldResult.url;
      publicId = cldResult.public_id;
    } else {
      // Local development disk fallback (NO Base64 stored in database)
      try {
        const uploadsDir = path.resolve(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, safeFilename), fileBuffer);
      } catch (diskErr) {
        // Ignored if read-only filesystem on Vercel
      }
      publicUrl = `${baseUrl}/api/cms/media/${mediaId}`;
    }

    // Store in PostgreSQL media_files table (URL + metadata ONLY, data = NULL)
    await query(
      `INSERT INTO media_files (id, filename, mime_type, size, url, public_id, resource_type, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [mediaId, safeFilename, mimeType, size, publicUrl, publicId, resourceType, null]
    );

    res.json({
      success: true,
      url: publicUrl,
      id: mediaId,
      filename: safeFilename,
      mimeType,
      size,
      storage: isCloudinaryConfigured() ? 'cloudinary' : 'local'
    });
  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ success: false, error: err.message || 'File upload failed.' });
  }
});

// Public Customer Review Photo Upload (Rate-limited, max 1MB, image only)
router.post('/review-upload', checkReviewUploadRateLimit, (req, res, next) => {
  reviewUpload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'Review photo exceeds 1MB limit. Please upload a smaller photo.'
        });
      }
      return res.status(400).json({ success: false, error: err.message || 'Error processing review photo upload' });
    }
    next();
  });
}, async (req, res) => {
  try {
    let fileBuffer = null;
    let filename = '';
    let mimeType = '';
    let size = 0;

    if (req.file) {
      fileBuffer = req.file.buffer;
      filename = req.file.originalname || 'review.jpg';
      mimeType = req.file.mimetype || 'image/jpeg';
      size = req.file.size;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ success: false, error: 'No review image provided.' });
    }

    // Strictly images only — NO videos, NO SVGs, NO executables
    const allowedReviewTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedReviewTypes.includes(mimeType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Only JPG, PNG, and WEBP images are allowed for review photos.'
      });
    }

    // Strict 1MB size limit
    if (size > 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'Review photo must be under 1MB.'
      });
    }

    const mediaId = 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const ext = path.extname(filename) || '.jpg';
    const safeFilename = `${mediaId}${ext}`;

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;

    let publicUrl = '';
    let publicId = null;

    if (isCloudinaryConfigured()) {
      const cldResult = await uploadStreamToCloudinary(fileBuffer, {
        folder: 'munnalal_painter/reviews',
        resource_type: 'image',
        transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }]
      });
      publicUrl = cldResult.secure_url || cldResult.url;
      publicId = cldResult.public_id;
    } else {
      try {
        const uploadsDir = path.resolve(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, safeFilename), fileBuffer);
      } catch (diskErr) {
        // Ignored in serverless
      }
      publicUrl = `${baseUrl}/api/cms/media/${mediaId}`;
    }

    // Save record to DB with URL and data = null
    await query(
      `INSERT INTO media_files (id, filename, mime_type, size, url, public_id, resource_type, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [mediaId, safeFilename, mimeType, size, publicUrl, publicId, 'image', null]
    );

    res.json({
      success: true,
      url: publicUrl,
      id: mediaId
    });
  } catch (err) {
    console.error('Review photo upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Review photo upload failed.' });
  }
});

// Serve Media / Redirect to Cloudinary CDN
router.get('/media/:id', async (req, res) => {
  try {
    let { id } = req.params;
    if (id.includes('.')) {
      id = id.substring(0, id.indexOf('.'));
    }

    // Check disk first for efficiency in local dev
    try {
      const uploadsDir = path.resolve(__dirname, '../uploads');
      if (fs.existsSync(uploadsDir)) {
        const diskFiles = fs.readdirSync(uploadsDir);
        const match = diskFiles.find(f => f.startsWith(id));
        if (match) {
          const filePath = path.join(uploadsDir, match);
          return res.sendFile(filePath);
        }
      }
    } catch (diskErr) {
      // Fallback to database
    }

    // Fetch from database
    const result = await query(`SELECT * FROM media_files WHERE id = $1`, [id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Media file not found' });
    }

    const row = result.rows[0];

    // If record has Cloudinary or external URL, redirect directly to CDN
    if (row.url && (row.url.startsWith('http://') || row.url.startsWith('https://'))) {
      return res.redirect(302, row.url);
    }

    // Fallback: Legacy serving if stored as Base64 in data column
    if (row.data) {
      const mimeType = row.mime_type || 'application/octet-stream';
      const fileBuffer = Buffer.from(row.data, 'base64');
      const fileSize = row.size || fileBuffer.length;

      // Streaming & cache headers
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Handle range request for video playback / seeking
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
          res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
          return res.end();
        }

        const chunkSize = (end - start) + 1;
        const subBuffer = fileBuffer.subarray(start, end + 1);

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
        res.setHeader('Content-Length', chunkSize);
        return res.end(subBuffer);
      }

      res.setHeader('Content-Length', fileSize);
      return res.end(fileBuffer);
    }

    return res.status(404).json({ success: false, error: 'Media file content not found' });
  } catch (err) {
    console.error('Error serving media:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve media file' });
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

// Admin login endpoint — verifies password and returns signed JWT token
router.post('/auth/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    const authRes = await query(`SELECT * FROM admin_auth WHERE id = 1`);
    let hash = '1+fqKl7800AftPztia5bwon5RSXUANxD8ErmEGmzEa8=';
    let salt = 'lpc8jRgcdvJIGtiaEXIVlQ==';

    if (authRes.rows.length > 0 && authRes.rows[0].hash && authRes.rows[0].salt) {
      hash = authRes.rows[0].hash;
      salt = authRes.rows[0].salt;
    }

    const isValid = verifyPassword(password, hash, salt);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }

    const token = generateAdminToken();
    res.json({
      success: true,
      token,
      message: 'Admin authentication successful.'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
});

router.post('/auth/setup-password', async (req, res) => {
  try {
    const { hash, salt } = req.body;
    if (!hash || !salt) {
      return res.status(400).json({ success: false, error: 'Hash and salt are required.' });
    }

    await query(
      `INSERT INTO admin_auth (id, hash, salt, updated_at) VALUES (1, $1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET hash = $1, salt = $2, updated_at = CURRENT_TIMESTAMP`,
      [hash, salt]
    );

    const token = generateAdminToken();
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
