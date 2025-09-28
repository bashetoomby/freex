const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'gateway' });
});

app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', 
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying to backend:', req.method, req.url);
  }
}));


app.use('/', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying to frontend:', req.method, req.url);
  }
}));

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway server running on port ${PORT}`);
  console.log(`Proxying /api/* to http://localhost:3001`);
  console.log(`Proxying /* to http://localhost:3000`);
});