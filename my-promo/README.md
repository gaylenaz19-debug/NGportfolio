# my-promo: portfolio promo

A 9:16 Remotion promo: 1080×1920, 60 FPS, 900 frames (15 s).

| Scene | Time | Component |
| --- | --- | --- |
| Terminal Hook | 0.0–2.5 s | `<TerminalHook>` |
| Portfolio Breakdown | 2.5–6.5 s | `<AudioPlayerCard>`, `<MarqueeCard>`, `<CodeOverlay>` |
| Generative Motion | 6.5–10.5 s | `<GenerativeBackground>`, `<FeatureTag>` |
| Call To Action | 10.5–15.0 s | `<CTAScene>` |

Every entrance runs on `spring()` with a custom mass, damping and stiffness (see `SPRINGS` in `src/theme.ts`), mapped through `interpolate()`.

```
npm i
npm run dev                                   # Studio preview
npx remotion render PortfolioPromo out/promo.mp4
```

Change the handle and URL in the `defaultProps` in `src/Root.tsx`, or pass them at render time with `--props='{"handle":"@you","url":"narleyportfolio.netlify.app"}'`.
