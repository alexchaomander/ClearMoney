import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ClearMoney";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0f172a",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                backgroundColor: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                fontWeight: 700,
                color: "white",
              }}
            >
              C
            </div>
            <span
              style={{ fontSize: 64, fontWeight: 700, color: "white" }}
            >
              Clear
              <span style={{ color: "#34d399" }}>Money</span>
            </span>
          </div>
          <p
            style={{
              fontSize: 32,
              color: "#94a3b8",
              margin: 0,
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            Feel confident about your money. Track accounts, understand
            tradeoffs, and decide your next best move.
          </p>
          <p style={{ fontSize: 20, color: "#10b981", margin: 0 }}>
            clearmoney.com
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
