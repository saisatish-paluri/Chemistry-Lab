import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.10.30.202", "10.10.30.*", "192.168.31.234", "192.168.31.*"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:  "images.unsplash.com",
        pathname:  "/**",
      },
    ],
  },
};

export default nextConfig;
