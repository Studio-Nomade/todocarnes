import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La subpágina de la feria se retiró: el agendamiento vive en la landing. Los enlaces ya
  // enviados por correo siguen funcionando.
  async redirects() {
    return [
      { destination: "/#agenda", permanent: true, source: "/agenda" },
      { destination: "/#agenda", permanent: true, source: "/agenda/:path*" },
    ];
  },
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
