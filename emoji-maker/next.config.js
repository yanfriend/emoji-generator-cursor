/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mffyfkwztmhvgntijknr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Keep any existing patterns
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig 