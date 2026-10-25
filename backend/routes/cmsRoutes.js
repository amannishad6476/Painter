import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { query, getDbStatus } from '../config/db.js';
import { initDb } from '../db/initDb.js';
import cloudinary, { isCloudinaryConfigured, uploadStreamToCloudinary } from '../config/cloudinary.js';
import { requireAdminAuth, verifyPassword, generateAdminToken } from '../utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * Safely constructs absolute base URL from incoming request headers or environment variables.
 * Handles comma-separated forwarded headers and ensures production uses HTTPS.
 */
const getBaseUrl = (req) => {
  if (process.env.BACKEND_PUBLIC_URL) {
    return process.env.BACKEND_PUBLIC_URL.replace(/\/+$/, '');
  }

  // Parse forwarded protocol safely (handling comma-separated proxy chains)
  const forwardedProto = req.headers['x-forwarded-proto'];
  let protocol = 'https';
  if (forwardedProto && typeof forwardedProto === 'string') {
    protocol = forwardedProto.split(',')[0].trim();
  } else if (req.protocol) {
    protocol = req.protocol;
  }

  // Parse forwarded host safely
  const rawHost = (req.headers['x-forwarded-host'] || req.get('host') || '').toString();
  let host = rawHost.split(',')[0].trim() || 'localhost:5000';

  // Fix truncated domain if ever forwarded as ainter-
  if (host.startsWith('ainter-backend-one.vercel.app')) {
    host = 'painter-backend-one.vercel.app';
  }

  // Enforce HTTPS for non-localhost hosts
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    protocol = 'https';
  }

  return `${protocol}://${host}`;
};

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

// Helper to ensure IST (+05:30) offset for datetime strings
const ensureIstIsoString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (trimmed.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.length === 16 ? `${trimmed}:00+05:30` : `${trimmed}+05:30`;
  }
  return trimmed;
};

// Helper to determine currently active offer in Asia/Kolkata
const getActiveOfferFromList = (offers) => {
  if (!Array.isArray(offers) || offers.length === 0) return null;
  const now = Date.now();

  const activeCandidates = offers.filter(offer => {
    if (!offer || !offer.isEnabled) return false;
    const startStr = ensureIstIsoString(offer.startDate);
    const endStr = ensureIstIsoString(offer.endDate);
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    if (isNaN(start) || isNaN(end)) return false;
    return now >= start && now <= end;
  });

  if (activeCandidates.length === 0) return null;

  // Prioritize most recently updated / created
  activeCandidates.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return activeCandidates[0];
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
    const festivalOffersRes = await query(`SELECT data FROM festival_offers ORDER BY created_at DESC`);
    const allFestivalOffers = (festivalOffersRes.rows || []).map(r => parseData(r));
    const activeOffer = getActiveOfferFromList(allFestivalOffers);

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
      hasAdminAuth: authRes.rows.length > 0,
      activeFestivalOffer: activeOffer || null,
      festivalOffers: allFestivalOffers
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

    const baseUrl = getBaseUrl(req);

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
      // Local development disk & serverless tmp fallback (NO Base64 stored in database)
      try {
        const uploadsDir = path.resolve(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, safeFilename), fileBuffer);
      } catch (diskErr) {
        // Ignored if read-only filesystem on Vercel
      }
      try {
        const tmpDir = path.join(os.tmpdir(), 'munnalal_uploads');
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        fs.writeFileSync(path.join(tmpDir, safeFilename), fileBuffer);
      } catch (tmpErr) {
        // Ignored
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

    const baseUrl = getBaseUrl(req);

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
      try {
        const tmpDir = path.join(os.tmpdir(), 'munnalal_uploads');
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        fs.writeFileSync(path.join(tmpDir, safeFilename), fileBuffer);
      } catch (tmpErr) {
        // Ignored
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

    // Check tmp directory as secondary fallback
    try {
      const tmpDir = path.join(os.tmpdir(), 'munnalal_uploads');
      if (fs.existsSync(tmpDir)) {
        const tmpFiles = fs.readdirSync(tmpDir);
        const match = tmpFiles.find(f => f.startsWith(id));
        if (match) {
          const filePath = path.join(tmpDir, match);
          return res.sendFile(filePath);
        }
      }
    } catch (tmpErr) {
      // Ignored
    }

    // Fetch from database
    const result = await query(`SELECT * FROM media_files WHERE id = $1`, [id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Media file not found' });
    }

    const row = result.rows[0];

    // Helper to detect if a URL is pointing back to this media endpoint (avoid redirect loop)
    const isSelfMediaUrl = (url) => {
      if (!url || typeof url !== 'string') return false;
      return url.includes(`/media/${id}`) || url.includes(`/api/cms/media/${id}`);
    };

    // If record has Cloudinary or external URL (and NOT self-referencing), redirect directly to CDN
    if (row.url && (row.url.startsWith('http://') || row.url.startsWith('https://')) && !isSelfMediaUrl(row.url)) {
      return res.redirect(302, row.url);
    }

    // If Cloudinary is configured and public_id exists, construct Cloudinary secure URL and redirect
    if (row.public_id && isCloudinaryConfigured()) {
      const cldUrl = cloudinary.url(row.public_id, {
        secure: true,
        resource_type: row.resource_type || 'image'
      });
      if (cldUrl && !isSelfMediaUrl(cldUrl)) {
        return res.redirect(302, cldUrl);
      }
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


// ─── FESTIVAL OFFERS & POPUP CRUD ──────────────────────────────────────────

// Public: Fetch currently active festival campaign (Asia/Kolkata schedule & enabled)
router.get('/festival-offers/active', async (req, res) => {
  try {
    const result = await query('SELECT data FROM festival_offers ORDER BY created_at DESC');
    const allOffers = (result.rows || []).map(r => parseData(r));
    const activeOffer = getActiveOfferFromList(allOffers);
    res.json({
      success: true,
      activeOffer: activeOffer || null
    });
  } catch (err) {
    console.error('Error fetching active festival offer:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch active festival offer' });
  }
});

// Admin: List all festival offers
router.get('/festival-offers', requireAdminAuth, async (req, res) => {
  try {
    const result = await query('SELECT data FROM festival_offers ORDER BY created_at DESC');
    const offers = (result.rows || []).map(r => parseData(r));
    res.json({
      success: true,
      offers
    });
  } catch (err) {
    console.error('Error fetching festival offers:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch festival offers' });
  }
});

// Admin: Create festival offer
router.post('/festival-offers', requireAdminAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const festivalName = (body.festivalName || '').trim();
    const theme = (body.theme || 'custom').toLowerCase().trim();
    const heading = (body.heading || '').trim();
    const description = (body.description || body.subheading || '').trim();
    const offerDetails = Array.isArray(body.offerDetails)
      ? body.offerDetails.map(d => String(d).trim()).filter(Boolean)
      : (body.offerDetails ? String(body.offerDetails).split('\n').map(s => s.trim()).filter(Boolean) : []);
    const bannerImage = (body.bannerImage || '').trim();
    const ctaText = (body.ctaText || 'Claim Offer on WhatsApp').trim();
    const ctaType = ['whatsapp', 'call', 'estimate', 'link'].includes(body.ctaType) ? body.ctaType : 'whatsapp';
    const ctaDestination = (body.ctaDestination || '').trim();
    const startDate = ensureIstIsoString(body.startDate);
    const endDate = ensureIstIsoString(body.endDate);
    const isEnabled = body.isEnabled !== undefined ? Boolean(body.isEnabled) : true;
    const cooldownHours = Number.isInteger(Number(body.cooldownHours)) ? Math.max(0, Math.min(720, Number(body.cooldownHours))) : 24;

    if (!festivalName) {
      return res.status(400).json({ success: false, error: 'Festival name is required.' });
    }
    if (!heading) {
      return res.status(400).json({ success: false, error: 'Offer heading is required.' });
    }
    const validThemes = ['diwali', 'holi', 'navratri', 'eid', 'christmas', 'custom'];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({ success: false, error: `Invalid theme. Allowed: ${validThemes.join(', ')}` });
    }
    if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
      return res.status(400).json({ success: false, error: 'Valid campaign start and end dates are required.' });
    }
    if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
      return res.status(400).json({ success: false, error: 'Campaign end date must be after start date.' });
    }

    const id = body.id || 'offer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const nowIso = new Date().toISOString();

    const newOffer = {
      id,
      festivalName,
      theme,
      heading,
      description,
      offerDetails,
      bannerImage,
      ctaText,
      ctaType,
      ctaDestination,
      startDate,
      endDate,
      isEnabled,
      cooldownHours,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    await query('INSERT INTO festival_offers (id, data) VALUES ($1, $2)', [id, JSON.stringify(newOffer)]);
    res.json({ success: true, data: newOffer });
  } catch (err) {
    console.error('Error creating festival offer:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create festival offer' });
  }
});

// Admin: Update festival offer
router.put('/festival-offers/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const festivalName = (body.festivalName || '').trim();
    const theme = (body.theme || 'custom').toLowerCase().trim();
    const heading = (body.heading || '').trim();
    const description = (body.description || body.subheading || '').trim();
    const offerDetails = Array.isArray(body.offerDetails)
      ? body.offerDetails.map(d => String(d).trim()).filter(Boolean)
      : (body.offerDetails ? String(body.offerDetails).split('\n').map(s => s.trim()).filter(Boolean) : []);
    const bannerImage = (body.bannerImage || '').trim();
    const ctaText = (body.ctaText || 'Claim Offer on WhatsApp').trim();
    const ctaType = ['whatsapp', 'call', 'estimate', 'link'].includes(body.ctaType) ? body.ctaType : 'whatsapp';
    const ctaDestination = (body.ctaDestination || '').trim();
    const startDate = ensureIstIsoString(body.startDate);
    const endDate = ensureIstIsoString(body.endDate);
    const isEnabled = body.isEnabled !== undefined ? Boolean(body.isEnabled) : true;
    const cooldownHours = Number.isInteger(Number(body.cooldownHours)) ? Math.max(0, Math.min(720, Number(body.cooldownHours))) : 24;

    if (!festivalName) {
      return res.status(400).json({ success: false, error: 'Festival name is required.' });
    }
    if (!heading) {
      return res.status(400).json({ success: false, error: 'Offer heading is required.' });
    }
    const validThemes = ['diwali', 'holi', 'navratri', 'eid', 'christmas', 'custom'];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({ success: false, error: `Invalid theme. Allowed: ${validThemes.join(', ')}` });
    }
    if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
      return res.status(400).json({ success: false, error: 'Valid campaign start and end dates are required.' });
    }
    if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
      return res.status(400).json({ success: false, error: 'Campaign end date must be after start date.' });
    }

    const updatedOffer = {
      ...body,
      id,
      festivalName,
      theme,
      heading,
      description,
      offerDetails,
      bannerImage,
      ctaText,
      ctaType,
      ctaDestination,
      startDate,
      endDate,
      isEnabled,
      cooldownHours,
      updatedAt: new Date().toISOString()
    };

    await query('UPDATE festival_offers SET data = $2 WHERE id = $1', [id, JSON.stringify(updatedOffer)]);
    res.json({ success: true, data: updatedOffer });
  } catch (err) {
    console.error('Error updating festival offer:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to update festival offer' });
  }
});

// Admin: Toggle offer isEnabled
router.patch('/festival-offers/:id/toggle', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT data FROM festival_offers WHERE id = $1', [id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Festival offer not found' });
    }

    const existing = parseData(result.rows[0]);
    const updatedOffer = {
      ...existing,
      isEnabled: !existing.isEnabled,
      updatedAt: new Date().toISOString()
    };

    await query('UPDATE festival_offers SET data = $2 WHERE id = $1', [id, JSON.stringify(updatedOffer)]);
    res.json({ success: true, data: updatedOffer });
  } catch (err) {
    console.error('Error toggling festival offer:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to toggle festival offer' });
  }
});

// Admin: Delete festival offer
router.delete('/festival-offers/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM festival_offers WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting festival offer:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to delete festival offer' });
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
