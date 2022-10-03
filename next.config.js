/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [{
      source: '/~/:tokenId/:topicId/:itemId',
      destination: '/api/time/:tokenId/:topicId/:itemId',
    }]
  }
}

module.exports = nextConfig
