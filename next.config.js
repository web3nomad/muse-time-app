/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [{
      source: '/~/:tokenId/:topicSlug/:arId',
      destination: '/api/time/:tokenId/:topicSlug/:arId',
    }]
  }
}

module.exports = nextConfig
