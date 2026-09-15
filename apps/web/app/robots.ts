import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://todocarnes.cl").replace(/\/$/, "");
  return { rules: { userAgent: "*", allow: ["/", "/agenda"] }, sitemap: `${origin}/sitemap.xml`, host: origin };
}
