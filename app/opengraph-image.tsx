// app/opengraph-image.tsx  <-- add this ONLY in the ADMIN repo (rentback-admin-web)
import { ImageResponse } from "next/og";
export const runtime = "edge";
export const alt = "RentBack Admin – Secure operations console";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(135deg, #111827 0%, #0F172A 40%, #059669 100%)",
          color: "white",
          fontFamily: "system-ui, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1 }}>
          <div>
            <span>Rent</span>
            <span style={{ color: "#34D399" }}>Back</span> Admin
          </div>
          <div style={{ marginTop: 12, fontWeight: 700, fontSize: 44 }}>
            Secure operations console
          </div>
        </div>

        <div style={{ fontSize: 28, opacity: 0.95 }}>
          Payouts, reconciliation, rewards, tenants & staff roles
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 22, opacity: 0.9 }}>
          <div>• Least privilege</div>
          <div>• Audit logs</div>
          <div>• 2FA</div>
        </div>
      </div>
    ),
    size
  );
}
