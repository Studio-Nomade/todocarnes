import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
        protocol: "https",
      },
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
      {
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/catalog-assets/**",
        protocol: "https",
      },
    ],
  },
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
