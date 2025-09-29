const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const http = require('http');

const app = express();
const server = http.createServer(app);

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
    console.log('Setting up proxies...');

    // 1. Сначала настройка WebSocket прокси
    const socketProxy = createProxyMiddleware('/socket.io', {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true,
        ws: true,
        logLevel: 'debug'
    });

    // Применяем WebSocket прокси
    app.use('/socket.io', socketProxy);
    
    // Обработка WebSocket upgrade
    server.on('upgrade', (req, socket, head) => {
        console.log('WebSocket upgrade request:', req.url);
        
        if (req.url.startsWith('/socket.io')) {
            socketProxy.upgrade(req, socket, head);
        }
    });

    // 2. Прокси для HTTP API
    app.use('/backend', createProxyMiddleware({
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true,
        pathRewrite: {
            '^/backend': '', // убираем /backend префикс
        },
    }));

    // 3. Все остальное к Next.js
    app.use('*', createProxyMiddleware({
        target: `http://localhost:${FRONTEND_DEV_PORT}`,
        changeOrigin: true,
    }));

    server.listen(FRONTEND_PORT, () => {
        console.log(`🚀 Main server running on port ${FRONTEND_PORT}`);
        console.log(`🔌 WebSocket: ws://localhost:${FRONTEND_PORT}/socket.io`);
        console.log(`📡 API: http://localhost:${FRONTEND_PORT}/backend/api`);
        console.log(`🌐 Frontend: http://localhost:${FRONTEND_PORT}`);
    });
}, 8000);

process.on('SIGTERM', () => {
    console.log('Shutting down...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
});