import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://todocarnes.cl").replace(/\/$/, "");
  return ["", "/agenda"].map((path, index) => ({ url: `${origin}${path}`, changeFrequency: index ? "monthly" : "weekly", priority: index ? 0.8 : 1 }));
}
