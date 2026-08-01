import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/initDb.js';
import cmsRoutes from './routes/cmsRoutes.js';

dotenv.config();

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

// Parse JSON bodies (up to 10MB to accommodate base64 image uploads)
app.use(express.json({ limit: '10MB' }));
app.use(express.urlencoded({ limit: '10MB', extended: true }));

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
