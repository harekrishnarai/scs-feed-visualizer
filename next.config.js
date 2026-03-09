/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: '/scs-feed-visualizer',
  assetPrefix: '/scs-feed-visualizer/',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    return config
  },
}

module.exports = nextConfig
