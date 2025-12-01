/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  webpack: (config, { isServer }) => {
    
    // If client-side, don't polyfill `fs`
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }

    return config;
  },
}

module.exports = nextConfig