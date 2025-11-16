/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    // Exclude native node modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        'pdf-to-png-converter': false,
        '@napi-rs/canvas': false,
      };
    }
    
    // Ignore native .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });
    
    // Mark these packages as external for server-side
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', '@napi-rs/canvas'];
    }
    
    return config;
  },
}

module.exports = nextConfig

