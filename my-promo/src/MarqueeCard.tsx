import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserCard } from "./BrowserCard";
import { CLAMP, COLORS, DISPLAY, MONO, SPRINGS } from "./theme";
import { useSpring } from "./useSpring";

const MARQUEE = "STEEZE IN MOTION • DIGITAL EXPERIENCE • ";
const SEGMENT_W = 1010; // width of one MARQUEE run at 40px

type MarqueeCardProps = {
  readonly enterAt: number;
  readonly style?: React.CSSProperties;
};

const Hoodie: React.FC<{ color: string }> = ({ color }) => (
  <svg width={150} height={150} viewBox="0 0 100 100">
    <path
      d="M35 12 Q50 24 65 12 L84 22 L96 52 L83 57 L79 44 L79 90 L21 90 L21 44 L17 57 L4 52 L16 22 Z"
      fill={color}
      stroke="rgba(255,255,255,0.25)"
      strokeWidth={1.5}
    />
    <path d="M38 14 Q50 34 62 14" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={3} />
  </svg>
);

// STEEZEINMOTION storefront: a dark streetwear drop page with a kinetic marquee.
export const MarqueeCard: React.FC<MarqueeCardProps> = ({ enterAt, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSpring();

  // The marquee winds up on a spring, then cruises.
  const windUp = s(enterAt, SPRINGS.soft);
  const travel = (frame - enterAt) * 7 * windUp + 260 * windUp;
  const offset = -(travel % SEGMENT_W);
  const hero = s(enterAt + 0.2 * fps, SPRINGS.heavy);

  return (
    <BrowserCard
      urls={["steezeinmotion.netlify.app", "steezeinmotionstudio.netlify.app"]}
      accent={COLORS.amber}
      width={920}
      height={980}
      style={style}
    >
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 80% 10%, ${COLORS.amber}33, transparent 55%)` }} />
      <div style={{ position: "absolute", inset: 0, padding: "40px 50px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, color: "rgba(255,255,255,0.65)" }}>
          <span>DROP 07</span>
          <span>SHOP · LOOKBOOK · STUDIO</span>
          <span style={{ color: COLORS.amber }}>BAG (2)</span>
        </div>
        <div
          style={{
            marginTop: 40,
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 136,
            lineHeight: 0.9,
            letterSpacing: -4,
            color: COLORS.white,
            translate: `0px ${interpolate(hero, [0, 1], [80, 0])}px`,
            opacity: interpolate(hero, [0, 0.4], [0, 1], CLAMP),
          }}
        >
          STEEZE
          <br />
          <span style={{ WebkitTextStroke: `3px ${COLORS.amber}`, color: "transparent" }}>IN MOTION</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 410,
          left: -60,
          right: -60,
          height: 84,
          background: COLORS.amber,
          rotate: "-4deg",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          boxShadow: `0 0 60px ${COLORS.amber}88`,
        }}
      >
        <div style={{ display: "flex", whiteSpace: "nowrap", translate: `${offset}px 0px` }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, color: COLORS.ink, letterSpacing: 1, width: SEGMENT_W, flexShrink: 0 }}>
              {MARQUEE}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", top: 560, left: 50, right: 50, display: "flex", gap: 28 }}>
        {[
          { name: "HEAVYWEIGHT HOODIE", spec: "480 GSM", price: "£85", color: "#16161C" },
          { name: "BOXY TEE", spec: "240 GSM", price: "£45", color: "#2A1208" },
        ].map((p, i) => {
          const t = s(enterAt + 0.35 * fps + i * 5, SPRINGS.snap);
          return (
            <div
              key={p.name}
              style={{
                flex: 1,
                borderRadius: 26,
                border: "1.5px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                padding: 24,
                translate: `0px ${interpolate(t, [0, 1], [120, 0])}px`,
                opacity: interpolate(t, [0, 0.4], [0, 1], CLAMP),
              }}
            >
              <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Hoodie color={p.color} />
              </div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: COLORS.white }}>{p.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, marginTop: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>{p.spec}</span>
                <span style={{ color: COLORS.amber }}>{p.price}</span>
              </div>
            </div>
          );
        })}
      </div>
    </BrowserCard>
  );
};
