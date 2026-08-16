const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  webpack: (config, { isServer }) => {
    
    // If client-side, don't polyfill `fs`
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true, // Permite o carregamento assíncrono de módulos WASM
    };

    return config;
  },
};

module.exports = withNextIntl(nextConfig);