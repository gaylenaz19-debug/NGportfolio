import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./Background";
import { CTAScene, type CTASceneProps } from "./CTAScene";
import { PortfolioScene } from "./PortfolioScene";
import { ServicesScene } from "./ServicesScene";
import { TerminalHook } from "./TerminalHook";
import { CLAMP, COLORS } from "./theme";

export type PortfolioPromoProps = CTASceneProps;

// A short cyan scan-flash that hides each hard cut.
const CutFlash: React.FC<{ readonly at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at - 5, at, at + 10], [0, 1, 0], { ...CLAMP, easing: Easing.out(Easing.quad) });

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: t * 0.55,
        background: `linear-gradient(180deg, transparent 0%, ${COLORS.cyan}55 ${30 + 40 * t}%, ${COLORS.white}AA ${35 + 40 * t}%, transparent 100%)`,
      }}
    />
  );
};

// 1080×1920 · 60 FPS · 900 frames (15s).
export const PortfolioPromo: React.FC<PortfolioPromoProps> = ({ handle, url }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Background />
      <Sequence name="Terminal Hook" durationInFrames={2.5 * fps} premountFor={fps}>
        <TerminalHook />
      </Sequence>
      <Sequence name="Portfolio Breakdown" from={2.5 * fps} durationInFrames={4 * fps} premountFor={fps}>
        <PortfolioScene />
      </Sequence>
      <Sequence name="Generative Motion" from={6.5 * fps} durationInFrames={4 * fps} premountFor={fps}>
        <ServicesScene />
      </Sequence>
      <Sequence name="Call To Action" from={10.5 * fps} durationInFrames={4.5 * fps} premountFor={fps}>
        <CTAScene handle={handle} url={url} />
      </Sequence>
      <CutFlash at={2.5 * fps} />
      <CutFlash at={6.5 * fps} />
      <CutFlash at={10.5 * fps} />
    </AbsoluteFill>
  );
};
