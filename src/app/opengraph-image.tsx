import { ImageResponse } from "next/og";
import { APP } from "@/lib/config";
import { BRAND_COLOR } from "@/lib/seo";

export const alt = `${APP.name} — Play. Win. Give.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Dynamically rendered Open Graph image (shared by social cards). */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #16120f 0%, #2a1410 55%, #5c2310 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 22,
              background: BRAND_COLOR,
              fontSize: 50,
            }}
          >
            ♥
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>
            {APP.name}
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Play. Win. Give.
          </div>
          <div style={{ fontSize: 36, color: "rgba(255,255,255,0.78)", maxWidth: 900, lineHeight: 1.3 }}>
            {APP.tagline}
          </div>
        </div>

        {/* Footer chips */}
        <div style={{ display: "flex", gap: 16, fontSize: 26, color: "rgba(255,255,255,0.85)" }}>
          {["Track your golf", "Monthly prize draws", "Give to charity"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "12px 26px",
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.25)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
