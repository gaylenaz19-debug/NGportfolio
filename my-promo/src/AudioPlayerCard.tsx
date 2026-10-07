import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserCard } from "./BrowserCard";
import { CLAMP, COLORS, DISPLAY, MONO, SPRINGS, glass } from "./theme";
import { useSpring } from "./useSpring";

const BARS = 28;
const WAVE_POINTS = 140;
const WAVE_W = 820;
const WAVE_H = 150;

type AudioPlayerCardProps = {
  readonly style?: React.CSSProperties;
};

// JAYEL web audio platform: a neon waveform and an EQ that hits on the beat.
export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({ style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSpring();

  // 120 BPM: a beat every half second, each one a fast attack and decay.
  const beatFrames = fps / 2;
  const sinceBeat = frame % beatFrames;
  const beat = 0.5 + 0.5 * Math.exp(-sinceBeat / 6);
  const progress = interpolate(frame, [0, 4 * fps], [0.32, 0.46], CLAMP);

  const wave = (offset: number) => {
    let d = "";
    for (let i = 0; i <= WAVE_POINTS; i++) {
      const x = (i / WAVE_POINTS) * WAVE_W;
      const env = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.06 + 1.3)) * Math.abs(Math.cos(i * 0.017));
      const y =
        WAVE_H / 2 +
        (WAVE_H / 2 - 8) *
          env *
          beat *
          Math.sin(i * 0.42 + frame * 0.22 + offset) *
          (0.7 + 0.3 * Math.sin(i * 0.11 - frame * 0.05));
      d += `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)} `;
    }
    return d;
  };

  const seconds = Math.floor(84 + frame / fps);
  const play = s(0.5 * fps, SPRINGS.pop);

  return (
    <BrowserCard urls={["jayelstudio.netlify.app"]} accent={COLORS.cyan} width={920} height={980} style={style}>
      <div style={{ position: "absolute", inset: 0, padding: "36px 50px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 92, letterSpacing: -2, color: COLORS.white, lineHeight: 1 }}>
              JAYEL
            </div>
            <div style={{ fontFamily: MONO, fontSize: 24, color: COLORS.cyan, letterSpacing: 6, marginTop: 8 }}>
              WEB AUDIO PLATFORM
            </div>
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 22,
              color: COLORS.green,
              padding: "10px 18px",
              borderRadius: 999,
              border: `1.5px solid ${COLORS.green}88`,
              boxShadow: `0 0 ${20 * beat}px ${COLORS.green}66`,
            }}
          >
            ● LIVE
          </div>
        </div>

        <div style={{ display: "flex", gap: 34, alignItems: "center" }}>
          <div
            style={{
              width: 230,
              height: 230,
              borderRadius: 28,
              background: `conic-gradient(from ${frame * 3}deg, ${COLORS.cyan}, ${COLORS.bg}, ${COLORS.amber}, ${COLORS.bg}, ${COLORS.cyan})`,
              boxShadow: `0 0 ${50 * beat}px ${COLORS.cyan}66`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: interpolate(beat, [0.5, 1], [1, 1.04]),
            }}
          >
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: 75,
                background: COLORS.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: 80,
                color: COLORS.white,
              }}
            >
              J
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: COLORS.white, lineHeight: 1.1 }}>
              Midnight Frequencies
            </div>
            <div style={{ fontFamily: MONO, fontSize: 26, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
              JAYEL · 128 BPM · Hi-Res
            </div>
            <div style={{ fontFamily: MONO, fontSize: 26, color: COLORS.cyan, marginTop: 18 }}>
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} / 3:45
            </div>
          </div>
        </div>

        <svg width={WAVE_W} height={WAVE_H} style={{ overflow: "visible" }}>
          <defs>
            <clipPath id="played">
              <rect x={0} y={-20} width={WAVE_W * progress} height={WAVE_H + 40} />
            </clipPath>
            <filter id="neon" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation={6} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={wave(0)} stroke="rgba(255,255,255,0.22)" strokeWidth={4} fill="none" />
          <g clipPath="url(#played)" filter="url(#neon)">
            <path d={wave(0)} stroke={COLORS.cyan} strokeWidth={5} fill="none" />
            <path d={wave(1.6)} stroke={COLORS.green} strokeOpacity={0.6} strokeWidth={3} fill="none" />
          </g>
          <line x1={WAVE_W * progress} x2={WAVE_W * progress} y1={-10} y2={WAVE_H + 10} stroke={COLORS.white} strokeWidth={3} />
        </svg>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 170 }}>
          {Array.from({ length: BARS }, (_, i) => {
            const level =
              (0.6 * Math.abs(Math.sin(i * 0.9 + frame * 0.21)) + 0.4 * Math.abs(Math.sin(i * 0.37 - frame * 0.13))) * beat;
            const h = 16 + 154 * Math.min(1, level * (1 - Math.abs(i - BARS / 2) / (BARS * 0.9)) * 1.35);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: h,
                  borderRadius: 6,
                  background: `linear-gradient(to top, ${COLORS.green}, ${COLORS.cyan} 60%, ${h > 135 ? COLORS.amber : COLORS.cyan})`,
                  boxShadow: `0 0 18px ${COLORS.cyan}55`,
                }}
              />
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 40 }}>
          {["⏮", "▶", "⏭"].map((icon, i) => (
            <div
              key={icon}
              style={{
                ...glass(i === 1 ? COLORS.cyan : COLORS.white, 0.8),
                width: i === 1 ? 120 : 88,
                height: i === 1 ? 120 : 88,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: i === 1 ? 46 : 32,
                color: COLORS.white,
                scale: i === 1 ? interpolate(play, [0, 1], [0.6, 1]) * interpolate(beat, [0.5, 1], [1, 1.07]) : 1,
                boxShadow: i === 1 ? `0 0 ${60 * beat}px ${COLORS.cyan}88` : undefined,
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>
    </BrowserCard>
  );
};
