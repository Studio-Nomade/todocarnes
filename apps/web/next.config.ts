import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep essential SEO metadata in <head> for every crawler and audit client.
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      {
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/profile-photos/**",
        protocol: "https",
      },
      {
        hostname: "127.0.0.1",
        pathname: "/storage/v1/object/public/profile-photos/**",
        port: "54321",
        protocol: "http",
      },
    ],
  },
};

export default nextConfig;
