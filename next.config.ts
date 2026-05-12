const nextConfig = {
  assetPrefix: ".",

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
