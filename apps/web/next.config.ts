import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep essential SEO metadata in <head> for every crawler and audit client.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
