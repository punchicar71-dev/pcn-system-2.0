/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'pcn-vehicle-images-punchicar71.s3.ap-southeast-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.ap-southeast-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
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
  // Suppress dynamic route warnings during build
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    maxSize: 50,
  },
  // Ignore build errors for known issues
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
