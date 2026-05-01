import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Suppress specific warnings in production logs
  logging: {
    fetches: { fullUrl: false },
  },
};

export default nextConfig;
