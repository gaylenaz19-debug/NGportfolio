import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP, COLORS, DISPLAY, SPRINGS } from "./theme";
import { useSpring } from "./useSpring";

type FeatureTagProps = {
  readonly label: string;
  readonly color: string;
  readonly delay: number;
  readonly x: number;
  readonly y: number;
  readonly tilt?: number;
};

// A floating glass pill that bounces in on a springy pop, then hovers.
export const FeatureTag: React.FC<FeatureTagProps> = ({ label, color, delay, x, y, tilt = 0 }) => {
  const frame = useCurrentFrame();
  const s = useSpring();
  const b = s(delay, SPRINGS.pop);
  const hover = Math.sin((frame - delay) / 18) * 8 * b;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "22px 34px",
        borderRadius: 999,
        background: "linear-gradient(140deg, rgba(20,20,28,0.86), rgba(11,11,15,0.7))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1.5px solid ${color}AA`,
        boxShadow: `0 20px 50px rgba(0,0,0,0.45), 0 0 34px ${color}44, inset 0 1px 0 rgba(255,255,255,0.15)`,
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: 40,
        color: COLORS.white,
        whiteSpace: "nowrap",
        opacity: interpolate(b, [0, 0.2], [0, 1], CLAMP),
        translate: `0px ${interpolate(b, [0, 1], [280, 0]) + hover}px`,
        scale: interpolate(b, [0, 1], [0.3, 1]),
        rotate: `${interpolate(b, [0, 1], [tilt * 4, tilt])}deg`,
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: 9, background: color, boxShadow: `0 0 16px ${color}` }} />
      {label}
    </div>
  );
};
