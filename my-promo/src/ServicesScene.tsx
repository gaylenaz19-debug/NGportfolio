import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserCard } from "./BrowserCard";
import { FeatureTag } from "./FeatureTag";
import { GenerativeBackground } from "./GenerativeBackground";
import { CLAMP, COLORS, DISPLAY, MONO, SERIF, SPRINGS } from "./theme";
import { useSpring } from "./useSpring";

const SERVICES = [
  { name: "Knotless Braids", time: "4h", price: "£140" },
  { name: "Silk Press", time: "2h", price: "£70" },
  { name: "Loc Retwist", time: "3h", price: "£90" },
];
const DAYS = ["MON 12", "TUE 13", "WED 14", "THU 15"];

// One booking UI in two skins: the cyber draft and the clean luxury build.
const BookingCard: React.FC<{ readonly isLight: boolean }> = ({ isLight }) => {
  const ink = isLight ? COLORS.ink : COLORS.white;
  const sub = isLight ? "rgba(11,11,15,0.55)" : "rgba(255,255,255,0.55)";
  const accent = isLight ? COLORS.ink : COLORS.cyan;
  const rule = isLight ? "rgba(11,11,15,0.1)" : "rgba(0,229,255,0.2)";

  return (
    <BrowserCard urls={["laidbyalex.netlify.app"]} accent={isLight ? "#B8A47E" : COLORS.cyan} width={920} height={820} light={isLight}>
      <div style={{ position: "absolute", inset: 0, padding: "40px 50px", display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: isLight ? SERIF : DISPLAY,
              fontWeight: isLight ? 500 : 900,
              fontSize: 80,
              letterSpacing: isLight ? 10 : -1,
              color: ink,
            }}
          >
            LAID BY ALEX
          </div>
          <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: sub, marginTop: 6 }}>
            LUXURY HAIR STUDIO · BOOK ONLINE
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${rule}` }} />
        {SERVICES.map((sv, i) => (
          <div
            key={sv.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 0",
              fontFamily: isLight ? SERIF : DISPLAY,
              fontSize: 40,
              fontWeight: isLight ? 500 : 800,
              color: ink,
            }}
          >
            <span>
              {i === 0 ? "◉ " : "○ "}
              {sv.name}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 28, color: i === 0 ? (isLight ? COLORS.ink : COLORS.cyan) : sub }}>
              {sv.time} · {sv.price}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 16 }}>
          {DAYS.map((d, i) => (
            <div
              key={d}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "18px 0",
                borderRadius: isLight ? 4 : 18,
                fontFamily: MONO,
                fontSize: 24,
                color: i === 1 ? (isLight ? COLORS.paper : COLORS.ink) : ink,
                background: i === 1 ? accent : "transparent",
                border: `1.5px solid ${i === 1 ? accent : rule}`,
                boxShadow: !isLight && i === 1 ? `0 0 30px ${COLORS.cyan}88` : undefined,
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 8,
            textAlign: "center",
            padding: "26px 0",
            borderRadius: isLight ? 4 : 999,
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 34,
            letterSpacing: 4,
            color: isLight ? COLORS.paper : COLORS.ink,
            background: isLight ? COLORS.ink : `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.green})`,
            boxShadow: isLight ? undefined : `0 0 50px ${COLORS.cyan}77`,
          }}
        >
          BOOK · TUE 13 · 11:00
        </div>
      </div>
    </BrowserCard>
  );
};

// Scene 3 (6.5s – 10.5s): the generative mesh spins, the screen pulses and
// the whole UI re-skins from dark cyber to clean luxury, then badges land.
export const ServicesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = useSpring();

  const shiftAt = Math.round(1.55 * fps);
  const enter = s(0, SPRINGS.heavy);
  const shift = s(shiftAt, SPRINGS.soft);
  const burst = s(shiftAt - 6, SPRINGS.pop);
  const naz = s(shiftAt + 0.5 * fps, SPRINGS.snap);
  const flash = interpolate(frame, [shiftAt - 4, shiftAt + 2, shiftAt + 26], [0, 0.85, 0], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const pulse = interpolate(burst, [0, 1], [0, 1], CLAMP) * (1 - shift * 0.6);
  const reveal = `circle(${interpolate(shift, [0, 1], [0, 125])}% at 50% 40%)`;

  const card: React.CSSProperties = {
    position: "absolute",
    top: 250,
    left: 80,
    scale: interpolate(enter, [0, 1], [0.82, 1]) * interpolate(burst, [0, 0.5, 1], [1, 0.97, 1]),
    translate: `0px ${interpolate(enter, [0, 1], [260, 0])}px`,
    opacity: interpolate(enter, [0, 0.3], [0, 1], CLAMP),
  };

  const header = (isLight: boolean) => (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 80,
        right: 80,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontFamily: isLight ? SERIF : DISPLAY,
        fontWeight: isLight ? 700 : 900,
        fontSize: 56,
        letterSpacing: isLight ? 2 : -1,
        color: isLight ? COLORS.ink : COLORS.white,
      }}
    >
      <span>{isLight ? "Clean luxury UI." : "GENERATIVE MOTION"}</span>
      <span style={{ fontFamily: MONO, fontSize: 26, color: isLight ? "rgba(11,11,15,0.5)" : COLORS.cyan }}>
        {isLight ? "LIGHT" : "DARK"}
      </span>
    </div>
  );

  return (
    <AbsoluteFill>
      {/* Dark cyber skin */}
      <GenerativeBackground rgb={[0, 229, 255]} pulse={pulse} />
      {header(false)}
      <div style={card}>
        <BookingCard isLight={false} />
      </div>

      {/* Clean luxury skin, revealed by an expanding circle on the pulse */}
      <AbsoluteFill style={{ clipPath: reveal, WebkitClipPath: reveal }}>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.paper}, #EDE6DA)` }} />
        <GenerativeBackground rgb={[11, 11, 15]} opacity={0.35} pulse={pulse} />
        {header(true)}
        <div style={card}>
          <BookingCard isLight />
        </div>
        <BrowserCard
          urls={["naznetworks.netlify.app"]}
          accent="#B8A47E"
          width={920}
          height={230}
          light
          style={{
            position: "absolute",
            top: 1100,
            left: 80,
            translate: `0px ${interpolate(naz, [0, 1], [500, 0])}px`,
            opacity: interpolate(naz, [0, 0.3], [0, 1], CLAMP),
          }}
        >
          <div style={{ position: "absolute", inset: 0, padding: "0 44px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 48, color: COLORS.ink, letterSpacing: -1 }}>NAZ NETWORKS</div>
              <div style={{ fontFamily: MONO, fontSize: 22, color: "rgba(11,11,15,0.55)", marginTop: 4 }}>Network installs · IT support</div>
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: COLORS.paper, background: COLORS.ink, padding: "18px 26px", borderRadius: 4 }}>
              GET A QUOTE →
            </div>
          </div>
        </BrowserCard>
      </AbsoluteFill>

      <FeatureTag label="Custom Web Audio" color={COLORS.cyan} delay={shiftAt + Math.round(0.75 * fps)} x={80} y={1370} tilt={-3} />
      <FeatureTag label="3D Motion Graphics" color={COLORS.amber} delay={shiftAt + Math.round(0.9 * fps)} x={440} y={1475} tilt={3} />
      <FeatureTag label="Next.js 15 / React" color={COLORS.green} delay={shiftAt + Math.round(1.05 * fps)} x={110} y={1580} tilt={2} />
      <FeatureTag label="High-Converting UI/UX" color={COLORS.white} delay={shiftAt + Math.round(1.2 * fps)} x={360} y={1685} tilt={-2} />

      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${COLORS.white}, ${COLORS.cyan}88 60%)`, opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
