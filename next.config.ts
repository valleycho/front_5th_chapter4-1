import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    domains: ['picsum.photos'],
  },
  output: "export",
};

export default nextConfig;
