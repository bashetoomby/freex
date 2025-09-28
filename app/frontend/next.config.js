const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8081/api/:path*',
      },
    ];
  },
  // Для продакшена укажите URL вашего Nest.js бэкенда
  async rewrites() {
    return process.env.NODE_ENV === 'production'
      ? [
        {
          source: '/api/:path*',
          destination: `${process.env.BACKEND_URL}/api/:path*`,
        },
      ]
      : [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8081/api/:path*',
        },
      ];
  },
};

module.exports = nextConfig;