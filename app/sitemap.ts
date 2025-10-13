// ADMIN /app/sitemap.ts
import type { MetadataRoute } from "next";

const base = "https://admin.rentback.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${base}/`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/sign-in`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
