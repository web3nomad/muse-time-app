/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [{
      source: '/~/:tokenId/:topicSlug/:topicsArId',
      destination: '/api/time/:tokenId/:topicSlug/:topicsArId',
    }]
  }
}

module.exports = nextConfig
