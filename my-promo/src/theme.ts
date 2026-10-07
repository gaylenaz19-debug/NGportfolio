import type { CSSProperties } from "react";
import type { SpringConfig } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

export const COLORS = {
  bg: "#0B0B0F",
  cyan: "#00E5FF",
  amber: "#FF5500",
  green: "#00FF66",
  white: "#FFFFFF",
  paper: "#F6F2EA",
  ink: "#0B0B0F",
} as const;

export const { fontFamily: DISPLAY } = loadArchivo("normal", {
  weights: ["500", "700", "800", "900"],
  subsets: ["latin"],
});
export const { fontFamily: MONO } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});
export const { fontFamily: SERIF } = loadPlayfair("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});

// Every entrance in the promo runs on one of these. No linear easing anywhere:
// each motion is spring() → interpolate().
export const SPRINGS = {
  // Fast, tight snap with a little overshoot: drops and slides.
  snap: { mass: 0.55, damping: 13, stiffness: 240 },
  // Heavy, weighty settle: kinetic type and camera moves.
  heavy: { mass: 2.2, damping: 17, stiffness: 140 },
  // Smooth with no bounce: typing, theme fades.
  soft: { mass: 1, damping: 26, stiffness: 90 },
  // Bouncy pop: badges and the CTA pulse.
  pop: { mass: 0.45, damping: 7.5, stiffness: 300 },
  // Long lateral sweep: card swashes.
  swash: { mass: 0.9, damping: 15, stiffness: 150 },
} satisfies Record<string, Partial<SpringConfig>>;

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const glass = (accent: string, strength = 1): CSSProperties => ({
  background: `linear-gradient(140deg, rgba(255,255,255,${0.11 * strength}) 0%, rgba(255,255,255,${0.03 * strength}) 55%, rgba(255,255,255,${0.06 * strength}) 100%)`,
  backdropFilter: "blur(28px) saturate(150%)",
  WebkitBackdropFilter: "blur(28px) saturate(150%)",
  border: `1.5px solid ${accent}70`,
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 40px 90px rgba(0,0,0,0.55), 0 0 70px ${accent}30`,
  borderRadius: 36,
});

// A deterministic 0..1 hash, so "random" detail is identical on every render.
export const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
