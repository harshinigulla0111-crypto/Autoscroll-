const { spawn } = require('child_process');
const path = require('path');

console.log('===================================================');
console.log('🚀 Starting AutoScroll Development Workspace Servers...');
console.log('===================================================');

const rootDir = path.resolve(__dirname, '..');

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
