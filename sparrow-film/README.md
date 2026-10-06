# Sparrow launch film

A 66-second, 1920×1080, 60 fps product film for Sparrow by Ravenry, built in Remotion (React + TypeScript). DOM/SVG only; every frame is a pure function of time, so playback and renders are deterministic.

## Run it

```bash
npm install
npm run studio      # scrub the timeline in Remotion Studio
npm run render      # → out/sparrow-launch-film.mp4
npm run preview     # → preview/sparrow-film.html (self-contained player, score embedded)
npm run score       # regenerate the placeholder score (needs python3 + numpy + ffmpeg)
```

## Where to edit

| What | File |
|---|---|
| Scene start/end times | `src/motion/timing.ts` → `TIMELINE` |
| Beats inside a scene (when a line types, when a card resolves) | `src/motion/timing.ts` → `CUES` |
| Headlines and supporting lines | `src/data/copy.ts` |
| Meeting sentence, participants, commitments, Sarah, chat, draft | `src/data/*.ts` |
| Colours, fonts, shadow | `src/theme.ts` |
| Positions objects are handed between scenes | `src/scenes/layout.ts` |
| Easing curve | `src/motion/easing.ts` (`cubic-bezier(.22, 1, .36, 1)`) |
| Sparrow bird: drawing, flight, wings, landing | `src/components/SparrowMark.tsx`; inspect it in Studio under **Lab** (`SparrowLab`, `SparrowSheet`, `SparrowRealSheet`, `SparrowCloseup`), or print its motion channels with `node preview/sparrow-curves.mjs` |

Scenes receive local time `t` (seconds since the scene began) and read cues; components are props-only and contain no timing.

## Continuity

Each scene inherits an object from the one before. A scene draws a hand-off object only while `t < sceneLength`; the next scene draws it from `t = 0` at the same coordinates (see `layout.ts`). Word positions come from canvas text measurement (`src/measure.ts`) after fonts load, so the extracted words land exactly inside the commitment card.

## Fonts

Instrument Sans (display), Fraunces (editorial serif) and IBM Plex Mono (metadata) — the faces the Sparrow app already uses — loaded from `@fontsource` so renders work offline.

## Audio

`public/score.mp3` is a generated placeholder: near-silence, a quiet tonal bed from 6s, soft pulse from 19s, plucked movement from 34s, a controlled lift to 59s, a short silence, then a resolve on the brand. UI ticks sit on the click, sends, hovers and card resolves. Replace it with a composed score and recorded dialogue for the final cut; the timings in `audio/score.py` show where each sound belongs.

## Licence note

Remotion is free for individuals and companies with up to three employees; larger teams need a company licence (remotion.pro).
