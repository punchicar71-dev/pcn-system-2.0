/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // Allow local images from uploads directory
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001'],
    },
  },
}

module.exports = nextConfig
