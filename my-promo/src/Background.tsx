import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "./theme";

// The persistent base layer: near-black ground, drifting glows, a receding
// vector floor grid, floating hairlines and a live film-grain noise.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at ${50 + 22 * Math.sin(frame / 95)}% 16%, ${COLORS.cyan}26, transparent 62%), radial-gradient(820px 820px at ${50 - 24 * Math.cos(frame / 120)}% 88%, ${COLORS.amber}22, transparent 60%)`,
        }}
      />
      <AbsoluteFill style={{ perspective: 820, perspectiveOrigin: "50% 40%" }}>
        <div
          style={{
            position: "absolute",
            left: -1400,
            right: -1400,
            bottom: -40,
            height: 1700,
            transformOrigin: "50% 100%",
            transform: "rotateX(74deg)",
            backgroundImage: `linear-gradient(${COLORS.cyan}55 2px, transparent 2px), linear-gradient(90deg, ${COLORS.cyan}55 2px, transparent 2px)`,
            backgroundSize: "120px 120px",
            backgroundPosition: `0px ${(frame * 2.2) % 120}px`,
            maskImage: "linear-gradient(to top, black 10%, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to top, black 10%, transparent 85%)",
          }}
        />
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = 180 + i * 300 + 28 * Math.sin(frame / 50 + i * 1.7);
          return (
            <line
              key={i}
              x1={-40}
              y1={y}
              x2={1120}
              y2={y - 220 + 40 * Math.cos(frame / 70 + i)}
              stroke={i % 2 === 0 ? COLORS.cyan : COLORS.white}
              strokeOpacity={0.08}
              strokeWidth={1.5}
              strokeDasharray="6 18"
              strokeDashoffset={-frame * 1.5}
            />
          );
        })}
      </svg>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "screen" }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.9}
            numOctaves={3}
            seed={Math.floor(frame / 2)}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
