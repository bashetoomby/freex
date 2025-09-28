const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');

const app = express();
const FRONTEND_PORT = process.env.PORT || 8080;
const BACKEND_PORT = 8081;
const FRONTEND_DEV_PORT = 3000;

console.log('Starting applications...');

// Запускаем бэкенд (Nest.js)
console.log('Starting Nest.js backend...');
const backendProcess = spawn('node', ['dist/main.js'], {
  cwd: './apps/backend',
  stdio: 'inherit',
  env: { ...process.env, PORT: BACKEND_PORT }
});

// Запускаем фронтенд (Next.js)
console.log('Starting Next.js frontend...');
const frontendProcess = spawn('npm', ['run', 'start'], {
  cwd: './apps/frontend',
  stdio: 'inherit',
  env: { ...process.env, PORT: FRONTEND_DEV_PORT }
});

// Ждем запуска сервисов
setTimeout(() => {
  // Прокси для API к бэкенду
  app.use('/api', createProxyMiddleware({
    target: `http://localhost:${BACKEND_PORT}`,
    changeOrigin: true,
  }));

  // Прокси для всего остального к Next.js
  app.use('*', createProxyMiddleware({
    target: `http://localhost:${FRONTEND_DEV_PORT}`,
    changeOrigin: true,
  }));

  app.listen(FRONTEND_PORT, () => {
    console.log(`Main server running on port ${FRONTEND_PORT}`);
    console.log(`API: http://localhost:${FRONTEND_PORT}/api -> http://localhost:${BACKEND_PORT}/api`);
    console.log(`Frontend: http://localhost:${FRONTEND_PORT} -> http://localhost:${FRONTEND_DEV_PORT}`);
  });
}, 5000);

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});