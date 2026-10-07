import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";
import { AudioPlayerCard } from "./AudioPlayerCard";
import { CodeOverlay } from "./CodeOverlay";
import { MarqueeCard } from "./MarqueeCard";
import { CLAMP, COLORS, DISPLAY, MONO, SPRINGS } from "./theme";
import { useSpring } from "./useSpring";

// Scene 2 (2.5s – 6.5s): JAYEL zooms forward, then STEEZEINMOTION swashes in
// from the right while the code overlay rewrites itself for each card.
export const PortfolioScene: React.FC = () => {
  const { fps } = useVideoConfig();
  const s = useSpring();
  const swashAt = Math.round(1.85 * fps);

  const zoom = s(0, SPRINGS.heavy);
  const out = s(swashAt, SPRINGS.swash);
  const swashIn = s(swashAt, SPRINGS.swash);
  const label = s(0.1 * fps, SPRINGS.snap);
  const labelFlip = s(swashAt, SPRINGS.snap);

  return (
    <AbsoluteFill style={{ perspective: 1800 }}>
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          opacity: interpolate(label, [0, 0.5], [0, 1], CLAMP),
          translate: `${interpolate(label, [0, 1], [-120, 0])}px 0px`,
        }}
      >
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: COLORS.white, letterSpacing: -1 }}>
          REAL WORK<span style={{ color: COLORS.cyan }}>.</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 30, color: labelFlip > 0.5 ? COLORS.amber : COLORS.cyan }}>
          {labelFlip > 0.5 ? "02" : "01"} / 02
        </div>
      </div>

      <AbsoluteFill style={{ top: 230, height: 1000, alignItems: "center" }}>
        <AudioPlayerCard
          style={{
            position: "absolute",
            transform: `translate3d(${interpolate(out, [0, 1], [0, -1350])}px, 0px, ${interpolate(zoom, [0, 1], [-900, 0])}px) rotateY(${interpolate(out, [0, 1], [0, 28])}deg) rotateX(${interpolate(zoom, [0, 1], [18, 0])}deg)`,
            opacity: interpolate(zoom, [0, 0.3], [0, 1], CLAMP),
          }}
        />
        <MarqueeCard
          enterAt={swashAt}
          style={{
            position: "absolute",
            transform: `translateX(${interpolate(swashIn, [0, 1], [1350, 0])}px) rotate(${interpolate(swashIn, [0, 1], [9, 0])}deg) skewX(${interpolate(swashIn, [0, 1], [-14, 0])}deg)`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ top: 1290, alignItems: "center" }}>
        <CodeOverlay switchAt={swashAt} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
