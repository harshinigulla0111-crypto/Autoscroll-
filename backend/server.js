const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadRoutes = require('./routes/upload');

// Enable CORS for frontend cross-origin requests
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api', apiRoutes);
app.use('/api', uploadRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AutoScroll ML Backend Service API',
    status: 'Running',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/ml/predict',
      'POST /api/ml/train',
      'POST /api/voicetest/save',
      'GET /api/user/profile'
    ]
  });
});

const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 AutoScroll ML Backend Server listening on port ${PORT}`);
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
