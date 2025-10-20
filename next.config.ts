import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  assetPrefix : ".",
  async rewrites() {
    return [
      {
        source: '/binance-api/:path*',
        destination: 'https://api.binance.com/:path*',
      },
    ];
  },
};

module.exports = {
  images: {
    domains: ["s2.coinmarketcap.com"],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript:{
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
