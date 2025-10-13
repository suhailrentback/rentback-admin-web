// ADMIN /app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
    sitemap: "https://admin.rentback.app/sitemap.xml",
    host: "https://admin.rentback.app",
  };
}
