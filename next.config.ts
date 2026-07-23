import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Webpack for build (Stellar SDK needs Buffer polyfill)
  turbopack: {},
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve("buffer/"),
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
    };
    return config;
  },
};

export default nextConfig;
