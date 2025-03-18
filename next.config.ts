import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Exclude lambda directory from the build
    config.externals = [...(config.externals || []), "aws-lambda"];
    config.resolve.alias = {
      ...config.resolve.alias,
      "aws-lambda": false,
    };
    return config;
  },
};

export default nextConfig;
