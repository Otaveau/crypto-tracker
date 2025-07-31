import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'assets.coingecko.com',
      'coin-images.coingecko.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.coingecko.com',
      },
    ],
  },
};

export default nextConfig;