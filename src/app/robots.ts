import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/** Generated at /robots.txt — allows public pages, blocks private surfaces. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/dashboard",
          "/api/",
          "/auth/",
          "/subscribe",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
