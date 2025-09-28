const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Сначала API routes к Nest.js
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

// Затем все остальное к Next.js
app.use('*', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
}));

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway running on ${PORT}`);
});