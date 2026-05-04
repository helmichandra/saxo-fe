const nextConfig = {
  assetPrefix: ".",
  async rewrites() {
    return [
      {
        source: "/binance-api/:path*",
        destination: "https://api.binance.com/:path*",
      },
    ];
  },
  images: {
    domains: ["s2.coinmarketcap.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;