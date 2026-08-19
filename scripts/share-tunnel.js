const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');

const baseDir = path.resolve(__dirname, '..');
const distDir = path.join(baseDir, 'frontend', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.apk': 'application/vnd.android.package-archive',
  '.wasm': 'application/wasm'
};

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

console.log('===================================================');
console.log('🔨 Preparing Production Bundle & Base APK...');
console.log('===================================================');

try {
  execSync('npm run build:apk', { cwd: baseDir, stdio: 'inherit' });
} catch (e) {
  console.log('Build notice:', e.message);
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(distDir, reqPath);

  // SPA Fallback for client routing
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      const headers = {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Content-Length': data.length
      };

      if (ext === '.apk') {
        headers['Content-Disposition'] = 'attachment; filename="AutoScroll-v1.0.0.apk"';
      }

      res.writeHead(200, headers);
      res.end(data);
    }
  });
});

const PORT = 5173;

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log('\n===================================================');
  console.log('✅ Active HTTP Application Server Ready on Port 5173');
  console.log(`💻 Local Browser Link:   http://localhost:${PORT}`);
  console.log(`📱 Wi-Fi Mobile Link:    http://${localIp}:${PORT}`);
  console.log(`📦 Wi-Fi APK Download:   http://${localIp}:${PORT}/AutoScroll-v1.0.0.apk`);
  console.log('===================================================');
  console.log('🚀 Connecting Global Public HTTPS Tunnel...\n');

  const tunnel = spawn('npx', ['-y', 'localtunnel', '--port', String(PORT)], { shell: true });

  tunnel.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('your url is:')) {
      const publicUrl = output.replace('your url is:', '').trim();
      console.log('===================================================');
      console.log('🌍 GLOBAL PUBLIC SHAREABLE WEBSITE URLS:');
      console.log(`👉 Web Application Link:  ${publicUrl}`);
      console.log(`👉 Direct APK Download:   ${publicUrl}/AutoScroll-v1.0.0.apk`);
      console.log('===================================================\n');
    } else {
      console.log(`[Tunnel] ${output}`);
    }
  });

  tunnel.stderr.on('data', (data) => {
    const errStr = data.toString().trim();
    if (errStr) console.log(`[Tunnel] ${errStr}`);
  });
});
