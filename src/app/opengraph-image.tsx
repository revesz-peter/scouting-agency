import { ImageResponse } from "next/og";

export const alt =
  "scouting — the progressive infrastructure behind model agencies.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.3em",
            color: "#a3a3a3",
            textTransform: "uppercase",
            marginBottom: "32px",
          }}
        >
          scouting
        </div>
        <div
          style={{
            fontSize: 58,
            color: "#ffffff",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          The progressive infrastructure behind model agencies.
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#737373",
            marginTop: "40px",
            letterSpacing: "0.1em",
          }}
        >
          Applied · Pre-Select · Scheduled · Voting · Onboarding · On the Board
        </div>
      </div>
    ),
    { ...size }
  );
}
