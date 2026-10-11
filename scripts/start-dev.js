const path = require('path');
const fs = require('fs');

// Check if running on Vercel or Production Server environment
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  const express = require('express');
  const app = express();
  const PORT = process.env.PORT || 3000;

  const distDir = fs.existsSync(path.join(__dirname, '../dist'))
    ? path.join(__dirname, '../dist')
    : path.join(__dirname, '../frontend/dist');

  // Serve static assets from build output
  app.use(express.static(distDir));

  // Mount backend API if available
  try {
    const backendApp = require('../backend/server');
    app.use('/api', backendApp);
  } catch (e) {
    console.log('Backend API mount notice:', e.message);
  }

  // SPA fallback to index.html
  app.get('*', (req, res) => {
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.send('<h1>AutoScroll AI is starting...</h1><p>Build output is initializing.</p>');
    }
  });

  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`AutoScroll Server listening on port ${PORT}`);
    });
  }

  module.exports = app;
} else {
  // Local development workspace launcher
  const { spawn } = require('child_process');
  const rootDir = path.resolve(__dirname, '..');

  console.log('===================================================');
  console.log('🚀 Starting AutoScroll Development Workspace Servers...');
  console.log('===================================================');

  // Spawn Backend Server
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(rootDir, 'backend'),
    shell: true,
    stdio: 'inherit'
  });

  // Spawn Frontend Vite Server
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(rootDir, 'frontend'),
    shell: true,
    stdio: 'inherit'
  });

  function handleExit(code, name) {
    console.log(`[${name}] process exited with code ${code}`);
  }

  backend.on('close', (code) => handleExit(code, 'Backend'));
  frontend.on('close', (code) => handleExit(code, 'Frontend'));

  process.on('SIGINT', () => {
    backend.kill();
    frontend.kill();
    process.exit();
  });
}
