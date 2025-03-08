import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["next-themes"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
