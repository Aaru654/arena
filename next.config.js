/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async rewrites() {
    return [
      { source: '/dashboard/collections', destination: '/collections' },
      { source: '/dashboard/collections/new', destination: '/collections/new' },
      { source: '/dashboard/collections/:id', destination: '/collections/:id' },
    ];
  },
};

module.exports = nextConfig;
