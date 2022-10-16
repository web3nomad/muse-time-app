/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [{
      source: '/~/:tokenId',
      destination: '/api/timetoken/:tokenId',
    }]
  }
}

module.exports = nextConfig
