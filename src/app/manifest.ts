import type { MetadataRoute } from "next";
import { APP } from "@/lib/config";
import { BRAND_COLOR, siteConfig } from "@/lib/seo";

/** PWA web app manifest (/manifest.webmanifest). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: APP.name,
    description: APP.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#16120f",
    theme_color: BRAND_COLOR,
    lang: "en",
    categories: ["sports", "lifestyle", "finance"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
