import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, COLORS, DISPLAY, MONO, SPRINGS, glass } from "./theme";
import { useSpring } from "./useSpring";

export type CTASceneProps = {
  readonly handle: string;
  readonly url: string;
};

const LINES: ReadonlyArray<ReadonlyArray<{ readonly word: string; readonly hot?: boolean }>> = [
  [{ word: "NEED" }, { word: "A" }],
  [{ word: "WEBSITE" }, { word: "THAT" }],
  [{ word: "STANDS", hot: true }, { word: "OUT?", hot: true }],
];

const ORBIT = [
  { label: "JAYEL", color: COLORS.cyan, x: -330, y: -760, r: -8 },
  { label: "STEEZE", color: COLORS.amber, x: 330, y: -720, r: 7 },
  { label: "LAID BY ALEX", color: COLORS.green, x: -320, y: 560, r: 6 },
  { label: "NAZ NETWORKS", color: COLORS.white, x: 320, y: 600, r: -6 },
];

// Scene 4 (10.5s – 15.0s): the camera pulls back to a glowing glass contact
// frame; the question lands word by word; the CTA pulses; the URL slides in.
export const CTAScene: React.FC<CTASceneProps> = ({ handle, url }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSpring();

  const pull = s(0, SPRINGS.heavy);
  const buttonAt = Math.round(1.6 * fps);
  const buttonIn = s(buttonAt, SPRINGS.pop);
  // Re-trigger a pop every 0.75s: a heartbeat pulse on the button.
  const beatLen = Math.round(0.75 * fps);
  const heartbeat =
    frame < buttonAt + 0.6 * fps
      ? 1
      : spring({ frame: (frame - buttonAt) % beatLen, fps, config: SPRINGS.pop });
  const lower = s(Math.round(2.2 * fps), SPRINGS.snap);
  const isLive = Math.floor(frame / 20) % 2 === 0;

  let wordIndex = 0;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          scale: interpolate(pull, [0, 1], [2.3, 1]),
          filter: `blur(${interpolate(pull, [0, 1], [16, 0])}px)`,
          translate: `0px ${interpolate(pull, [0, 1], [-140, -60])}px`,
        }}
      >
        {ORBIT.map((o, i) => (
          <div
            key={o.label}
            style={{
              ...glass(o.color, 0.8),
              position: "absolute",
              width: 330,
              height: 190,
              borderRadius: 24,
              display: "flex",
              alignItems: "flex-end",
              padding: 22,
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 32,
              color: COLORS.white,
              translate: `${o.x}px ${o.y + 14 * Math.sin(frame / 22 + i)}px`,
              rotate: `${o.r}deg`,
              opacity: interpolate(pull, [0.2, 0.8], [0, 0.85], CLAMP),
              background: `radial-gradient(circle at 75% 25%, ${o.color}44, rgba(255,255,255,0.04) 65%)`,
            }}
          >
            {o.label}
          </div>
        ))}

        {/* Glowing border: a rotating conic gradient behind a glass panel */}
        <div
          style={{
            position: "relative",
            width: 920,
            padding: 4,
            borderRadius: 48,
            background: `conic-gradient(from ${frame * 2.4}deg, ${COLORS.cyan}, ${COLORS.green}, ${COLORS.amber}, ${COLORS.cyan})`,
            boxShadow: `0 0 90px ${COLORS.cyan}55, 0 0 160px ${COLORS.amber}22`,
          }}
        >
          <div
            style={{
              ...glass(COLORS.cyan),
              border: "none",
              background: "rgba(11,11,15,0.86)",
              borderRadius: 44,
              padding: "64px 60px 70px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 46,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: 4, color: COLORS.green, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 16, height: 16, borderRadius: 8, background: COLORS.green, boxShadow: `0 0 ${isLive ? 20 : 6}px ${COLORS.green}` }} />
              AVAILABLE FOR NEW PROJECTS
            </div>

            <div style={{ perspective: 1200, textAlign: "center" }}>
              {LINES.map((line, li) => (
                <div key={li} style={{ display: "flex", justifyContent: "center", gap: 28 }}>
                  {line.map(({ word, hot }) => {
                    const w = s(Math.round(0.35 * fps) + wordIndex++ * 6, SPRINGS.heavy);
                    return (
                      <span
                        key={word}
                        style={{
                          display: "inline-block",
                          fontFamily: DISPLAY,
                          fontWeight: 900,
                          fontSize: 104,
                          lineHeight: 1.04,
                          letterSpacing: -3,
                          color: hot ? "transparent" : COLORS.white,
                          backgroundImage: hot ? `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.green})` : undefined,
                          backgroundClip: hot ? "text" : undefined,
                          WebkitBackgroundClip: hot ? "text" : undefined,
                          filter: hot ? `drop-shadow(0 0 24px ${COLORS.cyan}88)` : undefined,
                          opacity: interpolate(w, [0, 0.3], [0, 1], CLAMP),
                          transform: `translateY(${interpolate(w, [0, 1], [120, 0])}px) rotateX(${interpolate(w, [0, 1], [-90, 0])}deg)`,
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>

            <div
              style={{
                padding: "34px 64px",
                borderRadius: 999,
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: 50,
                letterSpacing: 1,
                color: COLORS.white,
                background: `linear-gradient(140deg, ${COLORS.amber}EE, #FF2E00CC)`,
                border: "2px solid rgba(255,255,255,0.35)",
                boxShadow: `inset 0 2px 0 rgba(255,255,255,0.35), 0 0 ${interpolate(heartbeat, [0, 1], [110, 50])}px ${COLORS.amber}AA`,
                scale: interpolate(buttonIn, [0, 1], [0, 1]) * interpolate(heartbeat, [0, 1], [1.08, 1]),
              }}
            >
              DM &apos;BUILD&apos; TO START
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Lower third */}
      <div
        style={{
          ...glass(COLORS.cyan),
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 130,
          borderRadius: 28,
          padding: "26px 34px",
          display: "flex",
          alignItems: "center",
          gap: 26,
          translate: `${interpolate(lower, [0, 1], [-1100, 0])}px 0px`,
        }}
      >
        <div style={{ width: 10, alignSelf: "stretch", borderRadius: 5, background: `linear-gradient(${COLORS.cyan}, ${COLORS.amber})` }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 46, color: COLORS.white }}>{handle}</div>
          <div style={{ fontFamily: MONO, fontSize: 32, color: COLORS.cyan, marginTop: 4 }}>{url}</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 28, color: COLORS.green }}>↗</div>
      </div>
    </AbsoluteFill>
  );
};
