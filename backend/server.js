import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/initDb.js';
import cmsRoutes from './routes/cmsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all requests from frontend
app.use(cors());

// Parse JSON bodies (up to 10MB to accommodate base64 image uploads)
app.use(express.json({ limit: '10MB' }));
app.use(express.urlencoded({ limit: '10MB', extended: true }));

// API Routes
app.use('/api/cms', cmsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Lucknow Painter Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint info
app.get('/', (req, res) => {
  res.send('Lucknow Painter Backend API Server is Active');
});

// Initialize database tables & default data asynchronously
initDb().catch(err => {
  console.error('Database initialization warning:', err);
});

// Start local server if not running serverlessly on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Lucknow Painter Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 CMS API available at http://localhost:${PORT}/api/cms/all`);
  });
}

export default app;
