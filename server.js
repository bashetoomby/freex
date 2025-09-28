const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'gateway' });
});

// API routes proxy to Nest.js
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  // УБЕРИТЕ pathRewrite - оставьте как есть
}));

// Все остальные запросы идут к Next.js
app.use('/', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  // Исключаем /api из этого прокси
  pathRewrite: (path, req) => {
    if (path.startsWith('/api')) {
      return path; // не переписываем API пути
    }
    return path;
  }
}));

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway server running on port ${PORT}`);
});