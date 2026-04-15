/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
};

module.exports = nextConfig;
