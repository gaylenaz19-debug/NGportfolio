import React from "react";
import { AbsoluteFill, Composition, Folder } from "remotion";
import { Background } from "./Background";
import { CTAScene } from "./CTAScene";
import { PortfolioPromo } from "./PortfolioPromo";
import { PortfolioScene } from "./PortfolioScene";
import { ServicesScene } from "./ServicesScene";
import { TerminalHook } from "./TerminalHook";

// Each scene on its own background, for previewing a scene in isolation.
const withBackground = (Scene: React.FC) => {
  const Wrapped: React.FC = () => (
    <AbsoluteFill>
      <Background />
      <Scene />
    </AbsoluteFill>
  );
  return Wrapped;
};

const TerminalHookPreview = withBackground(TerminalHook);
const PortfolioScenePreview = withBackground(PortfolioScene);
const ServicesScenePreview = withBackground(ServicesScene);

const CTAPreview: React.FC<{ handle: string; url: string }> = (props) => (
  <AbsoluteFill>
    <Background />
    <CTAScene {...props} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PortfolioPromo"
        component={PortfolioPromo}
        durationInFrames={900}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{ handle: "@narleygayle", url: "narleyportfolio.netlify.app" }}
      />
      <Folder name="Scenes">
        <Composition id="TerminalHook" component={TerminalHookPreview} durationInFrames={150} fps={60} width={1080} height={1920} />
        <Composition id="PortfolioBreakdown" component={PortfolioScenePreview} durationInFrames={240} fps={60} width={1080} height={1920} />
        <Composition id="GenerativeMotion" component={ServicesScenePreview} durationInFrames={240} fps={60} width={1080} height={1920} />
        <Composition
          id="CallToAction"
          component={CTAPreview}
          durationInFrames={270}
          fps={60}
          width={1080}
          height={1920}
          defaultProps={{ handle: "@narleygayle", url: "narleyportfolio.netlify.app" }}
        />
      </Folder>
    </>
  );
};
