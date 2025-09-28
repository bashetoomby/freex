const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'gateway ok', 
    service: 'gateway',
    timestamp: new Date().toISOString()
  });
});


const apiProxy = createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  logLevel: 'debug',
});


const frontendProxy = createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  logLevel: 'debug',
});


app.use('/api', apiProxy);
app.use('/', frontendProxy);

app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const waitForService = (url, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      fetch(url)
        .then(resolve)
        .catch(() => {
          if (Date.now() - start > timeout) {
            reject(new Error(`Service at ${url} not available`));
          } else {
            setTimeout(check, 1000);
          }
        });
    };
    check();
  });
};

// Ждем запуска сервисов перед запуском gateway
Promise.all([
  waitForService('http://localhost:3000/health').catch(() => console.log('Frontend starting...')),
  waitForService('http://localhost:3001/api/health').catch(() => console.log('Backend starting...'))
]).then(() => {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Gateway server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start gateway:', err);
  process.exit(1);
});