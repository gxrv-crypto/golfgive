import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { listCharities } from "@/lib/services/charity-service";

/**
 * Dynamic sitemap (/sitemap.xml): static public routes plus one entry per
 * charity profile, pulled live from the data layer.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/charities", priority: 0.9, changeFrequency: "daily" },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
    { path: "/how-it-works", priority: 0.7, changeFrequency: "monthly" },
    { path: "/docs", priority: 0.6, changeFrequency: "monthly" },
    { path: "/signup", priority: 0.5, changeFrequency: "yearly" },
    { path: "/login", priority: 0.4, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/responsible-play", priority: 0.3, changeFrequency: "yearly" },
  ];

  const base: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let charities: MetadataRoute.Sitemap = [];
  try {
    const list = await listCharities();
    charities = list.map((c) => ({
      url: `${siteUrl}/charities/${c.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch {
    // The sitemap must still build if the data layer is unavailable.
  }

  return [...base, ...charities];
}
