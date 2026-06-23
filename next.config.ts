import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage public URLs (charity media / avatars).
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
