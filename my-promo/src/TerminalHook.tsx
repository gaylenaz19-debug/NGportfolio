import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserCard } from "./BrowserCard";
import { CLAMP, COLORS, DISPLAY, MONO, SPRINGS, glass } from "./theme";
import { useSpring } from "./useSpring";

const COMMAND = "npx create-steeze-app --stack=nextjs-threejs";

const OUTPUT = [
  { text: "▲ Next.js 15 + Three.js template", color: COLORS.white },
  { text: "✓ spring physics engine linked", color: COLORS.green },
  { text: "✓ glassmorphism tokens loaded", color: COLORS.green },
  { text: "→ ready in 0.42s", color: COLORS.cyan },
];

const HEADLINE: ReadonlyArray<ReadonlyArray<string>> = [["WE", "DON'T"], ["BUILD", "BASIC"], ["WEBSITES."]];

const FAN = [
  { url: "jayelstudio.netlify.app", label: "JAYEL", accent: COLORS.cyan, x: -270, y: 70, rotY: 32, rotZ: -7, z: -160 },
  { url: "steezeinmotion.netlify.app", label: "STEEZE", accent: COLORS.amber, x: 0, y: -10, rotY: 0, rotZ: 0, z: 90 },
  { url: "laidbyalex.netlify.app", label: "LAID BY ALEX", accent: COLORS.green, x: 270, y: 70, rotY: -32, rotZ: 7, z: -160 },
];

// Scene 1 (0.0s – 2.5s): the terminal drops in, types the command, the
// headline bursts in 3D, then the terminal collapses into a fan of cards.
export const TerminalHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSpring();

  const drop = s(0, SPRINGS.snap);
  const typing = s(0.18 * fps, SPRINGS.soft, 0.8 * fps);
  const chars = Math.round(interpolate(typing, [0, 1], [0, COMMAND.length], CLAMP));
  const collapse = s(1.75 * fps, SPRINGS.swash);
  const fan = s(1.85 * fps, SPRINGS.snap);
  const isCursorOn = Math.floor(frame / 14) % 2 === 0;

  let wordIndex = 0;

  return (
    <AbsoluteFill>
      {/* Kinetic 3D headline */}
      <AbsoluteFill
        style={{
          top: 170,
          height: 560,
          alignItems: "center",
          justifyContent: "flex-start",
          perspective: 1300,
          translate: `0px ${interpolate(collapse, [0, 1], [0, -40])}px`,
        }}
      >
        {HEADLINE.map((line, li) => (
          <div key={li} style={{ display: "flex", gap: 30, transformStyle: "preserve-3d" }}>
            {line.map((word) => {
              const w = s(1.05 * fps + wordIndex++ * 5, SPRINGS.heavy);
              const isBasic = word === "BASIC";
              const strike = s(1.55 * fps, SPRINGS.snap);
              return (
                <div
                  key={word}
                  style={{
                    position: "relative",
                    fontFamily: DISPLAY,
                    fontWeight: 900,
                    fontSize: 128,
                    lineHeight: 1.02,
                    letterSpacing: -3,
                    color: isBasic ? COLORS.amber : COLORS.white,
                    opacity: interpolate(w, [0, 0.25], [0, 1], CLAMP),
                    transform: `translateZ(${interpolate(w, [0, 1], [700, 0])}px) rotateX(${interpolate(w, [0, 1], [-75, 0])}deg)`,
                    scale: interpolate(w, [0, 1], [2.4, 1]),
                    textShadow: [1, 2, 3, 4, 5, 6, 7, 8]
                      .map((d) => `${d}px ${d * 1.4}px 0 ${isBasic ? "#5a1e00" : "#0d3a42"}`)
                      .concat([`0 0 40px ${isBasic ? COLORS.amber : COLORS.cyan}66`])
                      .join(", "),
                  }}
                >
                  {word}
                  {isBasic && (
                    <div
                      style={{
                        position: "absolute",
                        left: -8,
                        right: -8,
                        top: "52%",
                        height: 12,
                        borderRadius: 6,
                        background: COLORS.white,
                        boxShadow: `0 0 24px ${COLORS.white}`,
                        transformOrigin: "0% 50%",
                        scale: `${interpolate(strike, [0, 1], [0, 1], CLAMP)} 1`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </AbsoluteFill>

      {/* Terminal → fan of browser cards */}
      <AbsoluteFill style={{ top: 760, height: 760, alignItems: "center", perspective: 1600 }}>
        <div
          style={{
            ...glass(COLORS.cyan),
            background: "rgba(10,14,20,0.72)",
            position: "absolute",
            width: 940,
            height: 470,
            padding: 0,
            overflow: "hidden",
            translate: `0px ${interpolate(drop, [0, 1], [-1500, 0])}px`,
            rotate: `${interpolate(drop, [0, 1], [-6, 0])}deg`,
            scale: `${interpolate(collapse, [0, 1], [1, 0.55])} ${interpolate(collapse, [0, 1], [1, 0.05])}`,
            opacity: interpolate(collapse, [0, 0.8], [1, 0], CLAMP),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "18px 24px",
              background: "rgba(0,0,0,0.35)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[COLORS.amber, "#FFC400", COLORS.green].map((c) => (
              <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
            ))}
            <div style={{ fontFamily: MONO, fontSize: 22, color: "rgba(255,255,255,0.55)", marginLeft: 16 }}>
              zsh — steeze@studio: ~/clients
            </div>
          </div>
          <div style={{ padding: "28px 30px", fontFamily: MONO, fontSize: 27, lineHeight: 1.6 }}>
            <div style={{ color: COLORS.white, wordBreak: "break-all" }}>
              <span style={{ color: COLORS.green }}>➜ </span>
              <span style={{ color: COLORS.cyan }}>~ </span>
              {COMMAND.slice(0, chars)}
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 34,
                  marginLeft: 4,
                  translate: "0px 6px",
                  background: COLORS.cyan,
                  opacity: isCursorOn || chars < COMMAND.length ? 1 : 0,
                }}
              />
            </div>
            {OUTPUT.map((line, i) => {
              const o = s(1.0 * fps + i * 4, SPRINGS.snap);
              return (
                <div
                  key={line.text}
                  style={{
                    color: line.color,
                    fontSize: 26,
                    opacity: interpolate(o, [0, 1], [0, 1], CLAMP),
                    translate: `${interpolate(o, [0, 1], [-40, 0])}px 0px`,
                  }}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        </div>

        {FAN.map((card, i) => {
          const f = s(1.85 * fps + i * 3, SPRINGS.snap);
          return (
            <BrowserCard
              key={card.url}
              urls={[card.url]}
              accent={card.accent}
              width={520}
              height={360}
              style={{
                position: "absolute",
                top: 80,
                opacity: interpolate(fan, [0, 0.3], [0, 1], CLAMP),
                transform: `translate3d(${interpolate(f, [0, 1], [0, card.x])}px, ${interpolate(f, [0, 1], [0, card.y])}px, ${interpolate(f, [0, 1], [0, card.z])}px) rotateY(${interpolate(f, [0, 1], [0, card.rotY])}deg) rotateZ(${interpolate(f, [0, 1], [0, card.rotZ])}deg) scale(${interpolate(f, [0, 1], [0.5, 1])})`,
                zIndex: i === 1 ? 2 : 1,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: 30,
                  background: `radial-gradient(circle at 70% 20%, ${card.accent}44, transparent 60%)`,
                }}
              >
                <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: COLORS.white, letterSpacing: -1 }}>
                  {card.label}
                </div>
                <div style={{ height: 8, width: 160, borderRadius: 4, background: card.accent, marginTop: 14 }} />
              </div>
            </BrowserCard>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
