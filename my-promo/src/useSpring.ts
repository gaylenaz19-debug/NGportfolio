import { spring, useCurrentFrame, useVideoConfig, type SpringConfig } from "remotion";

// spring() bound to the current frame and fps: `s(delayInFrames, config)`.
export const useSpring = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (delay: number, config: Partial<SpringConfig>, durationInFrames?: number) =>
    spring({ frame: frame - delay, fps, config, durationInFrames });
};
