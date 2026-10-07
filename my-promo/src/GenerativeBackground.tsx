import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

type GenerativeBackgroundProps = {
  // RGB triplet the mesh is drawn in.
  readonly rgb: readonly [number, number, number];
  readonly opacity?: number;
  // 0..1 burst that swells the sphere (driven by a spring upstream).
  readonly pulse?: number;
};

const POINTS = 560;
const RADIUS = 360;
const FOV = 950;

// A canvas particle sphere over a rolling wave mesh, redrawn every frame
// from useCurrentFrame() so it renders identically frame by frame.
export const GenerativeBackground: React.FC<GenerativeBackgroundProps> = ({ rgb, opacity = 1, pulse = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);

  // Fibonacci lattice: evenly spread points; i ± 21 and i ± 34 are neighbours.
  const lattice = useMemo(() => {
    const golden = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: POINTS }, (_, i) => {
      const y = 1 - (i / (POINTS - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      return [Math.cos(t) * r, y, Math.sin(t) * r] as const;
    });
  }, []);

  useLayoutEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, width, height);
    const [r, g, b] = rgb;
    const color = (a: number) => `rgba(${r},${g},${b},${(a * opacity).toFixed(3)})`;

    const cx = width / 2;
    const cy = height * 0.74;
    const ay = frame * 0.017;
    const ax = 0.42 + 0.22 * Math.sin(frame / 75);
    const radius = RADIUS * (1 + 0.22 * pulse + 0.03 * Math.sin(frame / 9));

    const projected = lattice.map(([x0, y0, z0], i) => {
      const wobble = 1 + 0.06 * Math.sin(frame * 0.08 + i * 0.7) * (0.4 + pulse);
      const x1 = x0 * Math.cos(ay) - z0 * Math.sin(ay);
      const z1 = x0 * Math.sin(ay) + z0 * Math.cos(ay);
      const y2 = y0 * Math.cos(ax) - z1 * Math.sin(ax);
      const z2 = y0 * Math.sin(ax) + z1 * Math.cos(ax);
      const k = FOV / (FOV + z2 * radius * wobble);
      return { x: cx + x1 * radius * wobble * k, y: cy + y2 * radius * wobble * k, depth: (1 - z2) / 2, k };
    });

    ctx.lineWidth = 1.2;
    projected.forEach((p, i) => {
      for (const step of [21, 34]) {
        const q = projected[i + step];
        if (!q) continue;
        ctx.strokeStyle = color(0.08 + 0.22 * Math.min(p.depth, q.depth));
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    });
    projected.forEach((p) => {
      ctx.fillStyle = color(0.25 + 0.75 * p.depth);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2 + 3.4 * p.depth * p.k, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rolling wave mesh, receding toward a horizon under the sphere.
    const rows = 16;
    const cols = 26;
    const horizon = height * 0.8;
    const point = (c: number, row: number) => {
      const depth = row / rows; // 0 near, 1 far
      const z = 1 + depth * 7;
      const xw = (c / cols - 0.5) * 3200;
      const wave = 70 * Math.sin(c * 0.45 + frame * 0.07) * Math.cos(row * 0.5 - frame * 0.05) * (1 + pulse);
      return [cx + xw / z, horizon + (900 - wave) / z] as const;
    };
    for (let row = 0; row <= rows; row++) {
      ctx.strokeStyle = color(0.32 * (1 - row / rows) + 0.04);
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const [x, y] = point(c, row);
        if (c === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.strokeStyle = color(0.14);
      ctx.beginPath();
      for (let row = 0; row <= rows; row++) {
        const [x, y] = point(c, row);
        if (row === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [frame, width, height, rgb, opacity, pulse, lattice]);

  return (
    <AbsoluteFill>
      <canvas ref={ref} width={width} height={height} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
