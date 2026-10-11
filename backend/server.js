const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const apiRoutes = require('./routes/api');
const uploadRoutes = require('./routes/upload');
const { router: authRoutes } = require('./routes/auth');
const runMigrations = require('./migrations/run_migrations');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles & media for local dev
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate Limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Enable CORS for frontend cross-origin requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes (support both /api and root paths for Vercel serverless routing)
app.use('/api', authRoutes);
app.use('/api', apiRoutes);
app.use('/api', uploadRoutes);

app.use('/', authRoutes);
app.use('/', apiRoutes);
app.use('/', uploadRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AutoScroll ML & Database Service API',
    status: 'Running',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'POST /api/ml/predict',
      'POST /api/ml/train',
      'POST /api/calibration/save',
      'GET /api/settings',
      'POST /api/settings',
      'POST /api/voicetest/save',
      'GET /api/user/profile',
      'POST /api/upload'
    ]
  });
});

// Run database migrations asynchronously if not in serverless warm-up
if (!process.env.VERCEL) {
  runMigrations().catch(err => console.log('Migration notice:', err.message));
}

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 AutoScroll Backend Server listening on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${PORT} is already in use by an active AutoScroll backend server.`);
      console.log(`   Continuing using the already running backend process...`);
    } else {
      console.error('Server startup error:', err);
    }
  });
}

module.exports = app;
