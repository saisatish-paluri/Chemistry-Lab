import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow HMR and dev-tool requests from the local-network IP so the browser
  // doesn't show a perpetual loading/buffering spinner when the site is opened
  // from another device on the same LAN. Add additional IPs here as needed.
  allowedDevOrigins: ["10.10.30.202", "10.10.30.*"],
};

export default nextConfig;
