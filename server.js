const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();


app.use(express.static(path.join(__dirname, 'apps/frontend/.next')));
app.use(express.static(path.join(__dirname, 'apps/frontend/public')));

// API routes proxy to Nest.js
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

// All other routes go to Next.js
app.use('*', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
}));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Gateway server running on port ${PORT}`);
});