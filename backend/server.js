import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './db/initDb.js';
import cmsRoutes from './routes/cmsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed Origins list
const allowedOrigins = [
  'https://www.munnalalpainter.in',
  'https://munnalalpainter.in',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000'
];

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(o => {
    const trimmed = o.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

// CORS options configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }
    
    // Dynamic fallback to reflect origin for cross-origin Vercel deployments
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Global CORS Middleware
app.use(cors(corsOptions));

// Explicit Preflight OPTIONS handler
app.options('*', cors(corsOptions));

// Safety net middleware ensuring CORS headers are explicitly attached to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Parse JSON bodies (up to 25MB to accommodate high-res uploads)
app.use(express.json({ limit: '25MB' }));
app.use(express.urlencoded({ limit: '25MB', extended: true }));

// Serve uploads directory statically if it exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    // Ignore in read-only environments
  }
}
app.use('/uploads', express.static(uploadsDir));

// Normalize double slashes in incoming request URL paths (e.g., //all -> /all)
app.use((req, res, next) => {
  if (req.url && req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// API Routes (Mounted at both /api/cms and / for route flexibility on Vercel)
app.use('/api/cms', cmsRoutes);
app.use('/', cmsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Lucknow Painter Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize database tables & default data asynchronously
initDb().catch(err => {
  console.error('Database initialization warning:', err);
});

// Start local server if not running serverlessly on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Lucknow Painter Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 CMS API available at http://localhost:${PORT}/all and http://localhost:${PORT}/api/cms/all`);
  });
}

export default app;
