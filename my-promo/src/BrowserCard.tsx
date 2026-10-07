import React from "react";
import { COLORS, MONO, glass } from "./theme";

type BrowserCardProps = {
  readonly urls: readonly string[];
  readonly accent: string;
  readonly width: number;
  readonly height: number;
  readonly light?: boolean;
  readonly style?: React.CSSProperties;
  readonly children?: React.ReactNode;
};

// A glass browser window: traffic lights, tabs and a URL bar over its page.
export const BrowserCard: React.FC<BrowserCardProps> = ({
  urls,
  accent,
  width,
  height,
  light = false,
  style,
  children,
}) => {
  const chromeText = light ? "rgba(11,11,15,0.6)" : "rgba(255,255,255,0.7)";

  return (
    <div
      style={{
        ...glass(accent),
        ...(light
          ? {
              background: COLORS.paper,
              border: "1.5px solid rgba(11,11,15,0.12)",
              boxShadow: "0 40px 90px rgba(0,0,0,0.25)",
            }
          : {}),
        width,
        height,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 24px",
          borderBottom: light ? "1px solid rgba(11,11,15,0.08)" : "1px solid rgba(255,255,255,0.08)",
          background: light ? "rgba(11,11,15,0.03)" : "rgba(0,0,0,0.25)",
        }}
      >
        {[COLORS.amber, "#FFC400", COLORS.green].map((c) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.9 }} />
        ))}
        <div style={{ display: "flex", gap: 10, marginLeft: 12, flex: 1, minWidth: 0 }}>
          {urls.map((url, i) => (
            <div
              key={url}
              style={{
                flex: i === 0 ? 1.4 : 1,
                minWidth: 0,
                padding: "8px 16px",
                borderRadius: 12,
                fontFamily: MONO,
                fontSize: 21,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: i === 0 ? (light ? COLORS.ink : COLORS.white) : chromeText,
                background: i === 0 ? (light ? "rgba(11,11,15,0.06)" : "rgba(255,255,255,0.08)") : "transparent",
                border: i === 0 ? `1px solid ${accent}55` : "1px solid transparent",
              }}
            >
              <span style={{ color: accent }}>●</span> {url}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>{children}</div>
    </div>
  );
};
