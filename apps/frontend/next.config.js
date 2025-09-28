const nextConfig = {
  async rewrites() {
    // Для продакшена на Railway
    return [
      {
        source: '/api/:path*',
        destination: `https://freex-production.up.railway.app/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;