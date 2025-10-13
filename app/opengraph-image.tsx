// ADMIN /app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0b0b0b 0%, #0b0b0b 60%, #0d1f1a 100%)",
          color: "white",
          padding: 80,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path d="M3 11.5L12 4l9 7.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 10v9h14v-9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -1 }}>
            RentBack Admin
          </div>
        </div>
        <div style={{ marginTop: 18, fontSize: 28, opacity: 0.9 }}>
          Secure operations console — payouts, reconciliation, rewards.
        </div>
        <div style={{ marginTop: 30, fontSize: 22, color: "#A7F3D0" }}>
          admin.rentback.app
        </div>
      </div>
    ),
    { ...size }
  );
}
