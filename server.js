const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ 
  dev, 
  dir: './apps/frontend' 
});
const nextHandler = nextApp.getRequestHandler();

// Порты
const FRONTEND_PORT = process.env.PORT || 8080;
const BACKEND_PORT = 8081;

async function startServer() {
  try {
    // Подготавливаем Next.js
    await nextApp.prepare();

    const app = express();

    // Прокси для API запросов к Nest.js
    app.use('/api', createProxyMiddleware({
      target: `http://localhost:${BACKEND_PORT}`,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // сохраняем /api префикс
      },
    }));

    // Все остальные запросы к Next.js
    app.get('*', (req, res) => {
      return nextHandler(req, res);
    });

    // Запускаем сервер
    app.listen(FRONTEND_PORT, (err) => {
      if (err) throw err;
      console.log(`> Frontend ready on http://localhost:${FRONTEND_PORT}`);
    });

  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Запускаем бэкенд и фронтенд
startServer();

// В этом же процессе запускаем Nest.js (простая версия)
require('child_process').fork('./apps/backend/dist/main.js', {
  env: { ...process.env, PORT: BACKEND_PORT }
});