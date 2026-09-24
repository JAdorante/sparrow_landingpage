import {EASE} from './easing';

export type Ease = (x: number) => number;
export type Pt = [number, number];
export type Rect = {x: number; y: number; w: number; h: number};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** 0→1 progress of a tween that starts at `start` and lasts `dur` seconds. */
export const tw = (t: number, start: number, dur: number, ease: Ease = EASE) =>
  ease(clamp01((t - start) / Math.max(dur, 1e-6)));

/** Value tween: a → b over [start, start + dur]. */
export const val = (
  t: number,
  start: number,
  dur: number,
  a: number,
  b: number,
  ease: Ease = EASE,
) => mix(a, b, tw(t, start, dur, ease));

/** Fade in at `inAt`, fade out at `outAt`. */
export const fade = (t: number, inAt: number, outAt = Infinity, dIn = 0.7, dOut = 0.75) =>
  Math.min(tw(t, inAt, dIn), 1 - tw(t, outAt, dOut));

/** Entrance style: opacity + small rise + blur that settles to nothing. */
export const enter = (t: number, at: number, dur = 0.8, rise = 10, blur = 4): React.CSSProperties => {
  const p = tw(t, at, dur);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * rise}px)`,
    filter: blur && p < 1 ? `blur(${(1 - p) * blur}px)` : undefined,
  };
};

/** Deterministic typing: the characters visible at time t. */
export const typed = (s: string, t: number, start: number, cps = 42) =>
  s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - start) * cps))));

export const typingEnd = (s: string, start: number, cps = 42) => start + s.length / cps;

/** Horizontal S-curve between two points — the film's only line shape. */
const controls = (a: Pt, b: Pt, bend: number) => {
  const dx = (b[0] - a[0]) * bend;
  const c1: Pt = [a[0] + dx, a[1]];
  const c2: Pt = [b[0] - dx, b[1]];
  return {c1, c2};
};

export const curvePath = (a: Pt, b: Pt, bend = 0.5) => {
  const {c1, c2} = controls(a, b, bend);
  return `M ${a[0]} ${a[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${b[0]} ${b[1]}`;
};

export const curvePoint = (a: Pt, b: Pt, u: number, bend = 0.5): Pt => {
  const {c1, c2} = controls(a, b, bend);
  const v = 1 - u;
  return [
    v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0],
    v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1],
  ];
};

export const lerpPt = (a: Pt, b: Pt, p: number): Pt => [mix(a[0], b[0], p), mix(a[1], b[1], p)];

export const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({
  x: mix(a.x, b.x, p),
  y: mix(a.y, b.y, p),
  w: mix(a.w, b.w, p),
  h: mix(a.h, b.h, p),
});
