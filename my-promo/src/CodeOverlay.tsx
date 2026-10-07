import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, COLORS, MONO, SPRINGS, glass } from "./theme";
import { useSpring } from "./useSpring";

type Token = readonly [string, string];

const KEY = "#C792EA";
const STR = COLORS.green;
const NUM = COLORS.amber;
const PLAIN = "rgba(255,255,255,0.85)";
const DIM = "rgba(255,255,255,0.4)";

type CodeOverlayProps = {
  readonly switchAt: number;
  readonly style?: React.CSSProperties;
};

// A floating glass editor whose CSS values update live with the frame.
export const CodeOverlay: React.FC<CodeOverlayProps> = ({ switchAt, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSpring();

  const beat = 0.5 + 0.5 * Math.exp(-(frame % (fps / 2)) / 6);
  const flip = s(switchAt, SPRINGS.snap);
  const enter = s(0.4 * fps, SPRINGS.snap);
  const isSecond = flip > 0.5;

  const audio: Token[][] = [
    [[KEY, "const "], [PLAIN, "Equalizer = () => ("]],
    [[PLAIN, "  <"], [COLORS.cyan, "Bar"], [PLAIN, " style={{"]],
    [[PLAIN, "    height: "], [NUM, `${Math.round(18 + 172 * beat)}`], [STR, "px"], [PLAIN, ","]],
    [[PLAIN, "    boxShadow: "], [STR, `'0 0 ${Math.round(60 * beat)}px #00E5FF'`], [PLAIN, ","]],
    [[PLAIN, "    scale: "], [NUM, (1 + 0.07 * beat).toFixed(3)], [PLAIN, ","]],
    [[PLAIN, "  }} />"]],
    [[DIM, "// beat-synced · 120 BPM"]],
  ];
  const marquee: Token[][] = [
    [[KEY, "const "], [PLAIN, "Marquee = () => ("]],
    [[PLAIN, "  <"], [COLORS.amber, "Track"], [PLAIN, " style={{"]],
    [[PLAIN, "    translate: "], [STR, `'${-Math.round(((frame - switchAt) * 7) % 1010)}px 0'`], [PLAIN, ","]],
    [[PLAIN, "    rotate: "], [STR, "'-4deg'"], [PLAIN, ","]],
    [[PLAIN, "    backdropFilter: "], [STR, `'blur(${Math.round(16 + 12 * beat)}px)'`], [PLAIN, ","]],
    [[PLAIN, "  }} />"]],
    [[DIM, "// spring({ mass: 0.9, stiffness: 150 })"]],
  ];
  const lines = isSecond ? marquee : audio;
  const accent = isSecond ? COLORS.amber : COLORS.cyan;

  return (
    <div
      style={{
        ...glass(accent),
        background: "rgba(11,11,15,0.62)",
        width: 920,
        padding: "26px 34px",
        fontFamily: MONO,
        fontSize: 29,
        lineHeight: 1.55,
        opacity: interpolate(enter, [0, 0.4], [0, 1], CLAMP),
        translate: `0px ${interpolate(enter, [0, 1], [220, 0])}px`,
        transform: `perspective(1200px) rotateX(${interpolate(flip, [0, 0.5, 1], [0, 90, 0], CLAMP)}deg)`,
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: DIM, marginBottom: 10 }}>
        <span>{isSecond ? "Marquee.tsx" : "Equalizer.tsx"}</span>
        <span style={{ color: accent }}>● live</span>
      </div>
      {lines.map((line, i) => (
        <div key={i} style={{ whiteSpace: "pre", background: i === 2 ? `${accent}14` : undefined, borderRadius: 8 }}>
          {line.map(([color, text], j) => (
            <span key={j} style={{ color }}>
              {text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
