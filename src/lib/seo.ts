/**
 * Centralised SEO configuration and JSON-LD (schema.org) builders.
 * Single-sourced so metadata, sitemap, robots, manifest and structured data
 * all stay consistent.
 */
import { APP } from "@/lib/config";

/** Canonical site origin (no trailing slash). Override with NEXT_PUBLIC_SITE_URL. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://golfgive.app"
).replace(/\/$/, "");

/** Brand coral (matches --primary in globals.css). */
export const BRAND_COLOR = "#F4592A";

export const siteConfig = {
  name: APP.name,
  title: `${APP.name} — Play. Win. Give.`,
  description: APP.tagline,
  url: siteUrl,
  locale: "en_IN",
  twitter: "@golfgive",
  keywords: [
    "golf",
    "golf score tracking",
    "Stableford",
    "charity",
    "charitable giving",
    "prize draw",
    "monthly draw",
    "win prizes",
    "donate",
    "subscription",
    "GolfGive",
  ],
  author: { name: "Gaurav N. Narnaware", url: "https://github.com/gxrv-crypto" },
};

/** Organization schema — describes the business behind the site. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP.name,
    legalName: APP.legalName,
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description: APP.tagline,
    sameAs: [siteConfig.author.url, "https://github.com/gxrv-crypto/golfgive"],
  };
}

/** WebSite schema — enables the sitelinks search box. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP.name,
    url: siteUrl,
    description: APP.tagline,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/charities?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** NGO schema for an individual charity profile page. */
export function charityJsonLd(charity: {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: charity.name,
    description: charity.description,
    url: `${siteUrl}/charities/${charity.id}`,
    ...(charity.imageUrl ? { image: charity.imageUrl } : {}),
    knowsAbout: charity.category,
    parentOrganization: { "@type": "Organization", name: APP.name, url: siteUrl },
  };
}

/** BreadcrumbList schema from an ordered list of {name, path} crumbs. */
export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${siteUrl}${c.path}`,
    })),
  };
}
