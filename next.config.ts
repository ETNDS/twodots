/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/you-and-pet', destination: '/bijoux-coppia', permanent: true },
      { source: '/animali', destination: '/collezione', permanent: true },
      { source: '/il-progetto', destination: '/storia', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
};

module.exports = nextConfig;
