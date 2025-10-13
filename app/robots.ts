// ADMIN: /app/robots.ts  (noindex, nofollow)
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://admin.rentback.app";
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
