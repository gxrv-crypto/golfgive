import type { NextConfig } from "next";

// Server Actions reject bodies over this size. Avatar/charity image uploads go
// through Server Actions, so the default 1 MB cap is too low (storage allows up
// to 5 MB). Override with SERVER_ACTIONS_BODY_SIZE_LIMIT (e.g. "8mb").
const bodySizeLimit = (process.env.SERVER_ACTIONS_BODY_SIZE_LIMIT ??
  "6mb") as `${number}mb`;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage public URLs (charity media / avatars).
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit,
    },
  },
};

export default nextConfig;
