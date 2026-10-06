import React from 'react';
import {C} from '../theme';
import {clamp01, mix, Pt} from '../motion/transitions';

/**
 * Sparrow — the brand bird that lands on the "m".
 *
 * The flight path moves only the centre of mass. Every other part is its own
 * system, driven by a physical cause:
 *
 *   position  → root            velocity → blur, detail, wing bob
 *   direction → body pitch      pitch    → head counter-rotation, tail lag
 *   curvature → roll            roll     → wing asymmetry, far-wing exposure
 *   approach  → legs, head aim  contact  → feet grip, compression, wing fold
 *   head      → envelope
 *
 * Local time (seconds after the cue):
 *   0.00–0.28  entry beat            1.35–1.62  last beat rises into flare
 *   0.28–0.67  climbing beat         1.46       legs lower (80%)
 *   0.67–1.00  cruise beat (max v)   1.61       toes open (88%)
 *   1.00–1.35  turning beat          1.54–1.73  small upward correction
 *   1.83 / 1.875  near then far foot contact
 *   1.83–2.21  compress, rebound, wings fold (primaries → secondaries → shoulder)
 *   2.25–2.45  one head adjustment · 2.48 one blink · 2.40–2.90 one breath
 */
export const FLY_DUR = 1.83;
const T1 = FLY_DUR;
const T2 = FLY_DUR + 0.045;

// ─── palette ────────────────────────────────────────────────────────────────
const INK = {
  head: '#151823',
  back: '#202431',
  chest: '#707583',
  belly: '#A2A6B0',
  cheek: '#3B4050',
  covert: '#222633',
  secondary: '#303542',
  primary: '#171A24',
  primaryAlt: '#1C1F2A',
  tailOuter: '#1A1D27',
  tailInner: '#232734',
  leg: '#1B1E28',
  beakTop: '#4D50E6',
  beakBottom: '#6769EE',
  eye: '#F4F5F9',
  pupil: '#0D0F16',
  edge: '#4A5062',
};

// ─── math ───────────────────────────────────────────────────────────────────
type V2 = [number, number];
type V3 = [number, number, number];
const DEG = Math.PI / 180;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const sm = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / Math.max(1e-6, b - a));
  return t * t * (3 - 2 * t);
};
const bump = (a: number, m: number, b: number, x: number) =>
  x <= a || x >= b ? 0 : x < m ? sm(a, m, x) : 1 - sm(m, b, x);
const cosEase = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));
const keys = (x: number, pts: [number, number][]) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) return mix(pts[i - 1][1], pts[i][1], sm(pts[i - 1][0], pts[i][0], x));
  }
  return pts[pts.length - 1][1];
};
const lerp2 = (a: V2, b: V2, p: number): V2 => [mix(a[0], b[0], p), mix(a[1], b[1], p)];
const add2 = (a: V2, b: V2, s = 1): V2 => [a[0] + b[0] * s, a[1] + b[1] * s];
const len2 = (a: V2) => Math.hypot(a[0], a[1]);
const norm2 = (a: V2): V2 => {
  const l = len2(a) || 1;
  return [a[0] / l, a[1] / l];
};
const norm3 = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const rot2 = (p: V2, deg: number): V2 => {
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
};
const f = (n: number) => n.toFixed(2);

/** Closed Catmull-Rom spline through points, as an SVG path. */
const smooth = (pts: V2[]) => {
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: V2 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: V2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
};

/** Tapered feather from root to tip, half-width hw. `blunt` rounds the tip off. */
const featherPath = (r: V2, t: V2, hw: number, blunt = 0) => {
  const L = len2([t[0] - r[0], t[1] - r[1]]);
  if (L < 0.4) return '';
  const d: V2 = [(t[0] - r[0]) / L, (t[1] - r[1]) / L];
  const n: V2 = [-d[1] * hw, d[0] * hw];
  const at = (u: number, s: number): V2 => [r[0] + d[0] * L * u + n[0] * s, r[1] + d[1] * L * u + n[1] * s];
  const p = (v: V2) => `${f(v[0])} ${f(v[1])}`;
  const [a, c1, c2, c3, c4, b] = [at(0, 0.7), at(0.3, 1), at(0.82, 0.72), at(0.82, -0.72), at(0.3, -1), at(0, -0.7)];
  if (blunt <= 0) return `M${p(a)} C${p(c1)} ${p(c2)} ${p(t)} C${p(c3)} ${p(c4)} ${p(b)} Z`;
  const tl = at(1 - blunt * 0.08, blunt * 0.55);
  const tr = at(1 - blunt * 0.08, -blunt * 0.55);
  return `M${p(a)} C${p(c1)} ${p(at(0.8, 0.85))} ${p(tl)} Q${p(at(1.02, 0))} ${p(tr)} C${p(at(0.8, -0.85))} ${p(c4)} ${p(b)} Z`;
};

// ─── flight path: centre of mass only ───────────────────────────────────────
// Offsets in px from the resting centre of mass. The Bézier is the macro path;
// steer() adds the overshoot and the upward correction before the descent.
const FROM: V2 = [640, -30];
const C1: V2 = [372, -268];
const C2: V2 = [126, -78];
const bez = (u: number): V2 => {
  const v = 1 - u;
  const a = v * v * v;
  const b = 3 * v * v * u;
  const c = 3 * v * u * u;
  return [a * FROM[0] + b * C1[0] + c * C2[0], a * FROM[1] + b * C1[1] + c * C2[1]];
};

const N = 480;
const ARC: number[] = (() => {
  const out = [0];
  let prev = bez(0);
  for (let i = 1; i <= N; i++) {
    const p = bez(i / N);
    out.push(out[i - 1] + len2([p[0] - prev[0], p[1] - prev[1]]));
    prev = p;
  }
  return out.map((v) => v / out[N]);
})();
const uAtArc = (s: number) => {
  if (s <= 0) return 0;
  if (s >= 1) return 1;
  let lo = 0;
  let hi = N;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ARC[mid] < s) lo = mid;
    else hi = mid;
  }
  return (lo + (s - ARC[lo]) / Math.max(1e-9, ARC[hi] - ARC[lo])) / N;
};

// Relative speed over normalised flight time: fast entry, fastest sweep at
// 45–60%, then the last 15% brakes hard.
const SPEED: [number, number][] = [
  [0, 1],
  [0.14, 1.05],
  [0.28, 1.12],
  [0.44, 1.45],
  [0.55, 1.4],
  [0.68, 1.08],
  [0.8, 0.8],
  [0.86, 0.5],
  [0.91, 0.26],
  [0.96, 0.08],
  [1, 0.03],
];
const DIST: number[] = (() => {
  const out = [0];
  for (let i = 1; i <= N; i++) out.push(out[i - 1] + keys((i - 0.5) / N, SPEED));
  return out.map((v) => v / out[N]);
})();
const arcAt = (tn: number) => {
  const x = clamp01(tn) * N;
  const i = Math.min(N - 1, Math.floor(x));
  return mix(DIST[i], DIST[i + 1], x - i);
};

const steer = (tn: number, l: number): V2 => {
  const alive = 1 - sm(0.78, 0.9, tn);
  return [
    -15 * bump(0.58, 0.75, 0.9, tn) + 1.2 * Math.sin(l * 6.1 + 0.7) * alive,
    11 * bump(0.6, 0.76, 0.87, tn) - 7 * bump(0.84, 0.885, 0.945, tn) + 1.4 * Math.sin(l * 8.3) * Math.sin(l * 2.9 + 1) * alive,
  ];
};

const flightPath = (l: number): V2 => {
  if (l >= T1) return [0, 0];
  if (l < 0) {
    const a = flightPath(0);
    const b = flightPath(0.01);
    return [a[0] + (b[0] - a[0]) * (l / 0.01), a[1] + (b[1] - a[1]) * (l / 0.01)];
  }
  const tn = l / FLY_DUR;
  const p = bez(uAtArc(arcAt(tn)));
  const s = steer(tn, l);
  return [p[0] + s[0], p[1] + s[1]];
};

const H = 1 / 120;
const vel = (l: number): V2 => {
  const a = flightPath(l - H);
  const b = flightPath(l + H);
  return [(b[0] - a[0]) / (2 * H), (b[1] - a[1]) / (2 * H)];
};
/** Travel direction: 0 = level flight to the left, positive = climbing. */
const heading = (l: number) => {
  const v = vel(l);
  if (Math.hypot(v[0], v[1]) < 1) return 0;
  return clamp(Math.atan2(-v[1], -v[0]) / DEG, -80, 80);
};

// ─── body pitch, roll, head, tail ───────────────────────────────────────────
const pitchRaw = (l: number) => mix(clamp(heading(l) * 0.5, -15, 22), 17, sm(T1 - 0.32, T1 - 0.1, l));
const pitchFlight = (l: number) => {
  let s = 0;
  for (let i = 0; i < 6; i++) s += pitchRaw(l - i * 0.02);
  return s / 6;
};
const PITCH_AT_CONTACT = pitchFlight(T1);
const pitch = (l: number) =>
  l < T1
    ? pitchFlight(l)
    : mix(PITCH_AT_CONTACT, 0, sm(T1, T1 + 0.32, l)) - 1.2 * bump(T1 + 0.14, T1 + 0.27, T1 + 0.42, l);

const roll = (l: number) =>
  clamp(((heading(l - 0.03) - heading(l + 0.03)) / 0.06) * 0.2, -12, 12) * (1 - sm(T1 - 0.35, T1 - 0.15, l));

/** Saturates smoothly instead of pinning at the limit. */
const soft = (x: number, lim: number) => lim * Math.tanh(x / lim);

/** World angle of the head. Level-ish while flying; aims at the perch on approach. */
const headFlight = (l: number) => {
  const tn = clamp01(l / FLY_DUR);
  const p = flightPath(l);
  const d: V2 = [-3 - (p[0] - 26), 23 - (p[1] - 20)];
  const look = clamp(Math.atan2(-d[1], -d[0]) / DEG, -32, 8);
  const aim = sm(0.55, 0.8, tn);
  return mix(pitch(l) * 0.55, look * 0.6, aim) - 5 * bump(0.76, 0.8, 0.86, tn) + 4.5 * bump(0.86, 0.91, 0.97, tn);
};
const HEAD_AT_CONTACT = headFlight(T1 - 1e-4);
const headWorld = (l: number) =>
  l < T1 ? headFlight(l) : mix(HEAD_AT_CONTACT, 0, sm(T1, T1 + 0.3, l)) + 1.6 * bump(T1 + 0.42, T1 + 0.5, T1 + 0.62, l);

// ─── wings ──────────────────────────────────────────────────────────────────
export type Wing = {e: number; sweep: number; spreadS: number; spreadP: number; prim: number; lift: number};

type Beat = {at: number; dur: number; top: number; bottom: number; up: number; far: number; bob: number};
const BEATS: Beat[] = [
  {at: -0.08, dur: 0.36, top: 74, bottom: -46, up: 0.6, far: 1, bob: 2.2}, // strong entry
  {at: 0.28, dur: 0.39, top: 84, bottom: -56, up: 0.55, far: 1, bob: 3}, // strongest, climbing
  {at: 0.67, dur: 0.33, top: 60, bottom: -28, up: 0.66, far: 0.95, bob: 1.4}, // cruising
  {at: 1.0, dur: 0.35, top: 70, bottom: -42, up: 0.6, far: 0.78, bob: 2}, // asymmetric turn
];
const B5 = {at: 1.35, down: 0.1, rise: 0.19, top: 66, bottom: -30};
const FLARE = {e: 60, sweep: 14};
const MID_E = 15;

const wingAt = (l: number, far = false): Wing => {
  if (l >= T1) {
    return {
      e: mix(FLARE.e, 26, sm(T1, T1 + 0.26, l)),
      sweep: mix(FLARE.sweep, 8, sm(T1, T1 + 0.26, l)),
      spreadP: 1 - sm(T1, T1 + 0.2, l),
      spreadS: 1 - sm(T1 + 0.07, T1 + 0.3, l),
      prim: 1 - sm(T1, T1 + 0.15, l),
      lift: 1.2 * (1 - sm(T1 + 0.17, T1 + 0.38, l)),
    };
  }
  if (l >= B5.at) {
    const u = l - B5.at;
    if (u < B5.down) {
      const x = u / B5.down;
      const e = mix(B5.top, B5.bottom, cosEase(x));
      return {e, sweep: mix(10, 2, x), spreadS: mix(0.9, 1, sm(0, 0.35, x)), spreadP: mix(0.9, 1, sm(0, 0.35, x)), prim: 1, lift: 1.2};
    }
    const x = clamp01((u - B5.down) / B5.rise);
    const hold = l - (B5.at + B5.down + B5.rise);
    const flutter = hold > 0 ? Math.sin(hold * 2 * Math.PI * 9) * sm(0, 0.06, hold) : 0;
    const s = 1 - 0.14 * bump(0, 0.45, 1, x);
    return {
      e: mix(B5.bottom, FLARE.e, cosEase(x)) + 3.5 * flutter,
      sweep: mix(2, FLARE.sweep, sm(0.2, 1, x)),
      spreadS: s,
      spreadP: s,
      prim: mix(0.55, 1, sm(0.4, 1, x)) - 0.08 * Math.abs(flutter),
      lift: 1.2,
    };
  }
  let i = 0;
  while (i < BEATS.length - 1 && l >= BEATS[i + 1].at) i++;
  const b = BEATS[i];
  const nextTop = i < BEATS.length - 1 ? BEATS[i + 1].top : B5.top;
  const p = clamp01((l - b.at) / b.dur);
  const amp = far ? b.far : 1;
  let e: number;
  let spread: number;
  let prim: number;
  let sweep: number;
  if (p < 0.36) {
    const x = p / 0.36;
    e = mix(b.top, b.bottom, cosEase(x));
    spread = mix(0.9, 1, sm(0, 0.35, x));
    prim = mix(0.8, 1, sm(0, 0.3, x));
    sweep = mix(10, 2, x);
  } else {
    const q = (p - 0.36) / 0.64;
    // Wrist leads the recovery: the wing clears the back early, then eases to the top.
    e = mix(b.bottom, nextTop, mix(cosEase(q), 1 - (1 - q) ** 2.2, 0.7));
    spread = q < 0.5 ? mix(1, b.up, sm(0, 0.45, q)) : mix(b.up, 0.9, sm(0.55, 1, q));
    prim = q < 0.5 ? mix(1, 0.1, sm(0, 0.35, q)) : mix(0.1, 0.8, sm(0.7, 1, q));
    sweep = 2 + 30 * bump(0, 0.5, 1, q) + 8 * sm(0.6, 1, q);
  }
  return {e: MID_E + (e - MID_E) * amp, sweep, spreadS: spread, spreadP: spread, prim, lift: 1.2};
};

/** Body rises on the downstroke, sinks on the upstroke (px). */
const wingBob = (l: number) => {
  if (l >= T1 - 0.2) return 0;
  const w = wingAt(l - 0.05);
  let i = 0;
  while (i < BEATS.length - 1 && l >= BEATS[i + 1].at) i++;
  const amp = l >= B5.at ? 1.2 : BEATS[i].bob;
  return clamp((w.e - MID_E) / 60, -1, 1) * amp * 0.7 * (1 - sm(1.45, 1.6, l));
};

// ─── rig geometry (bird units; origin = centre of mass, facing left) ────────
const PIV = 11; // compression pivot: belly line
const NECK: V2 = [-15, -9];
const TAIL: V2 = [19.5, -1.4];
const HIP_NEAR: V2 = [-3, 8.2];
const HIP_FAR: V2 = [3.4, 7.8];
const LT = 6.8;
const TOE_DROP = 0.25;
const ANKLE_NEAR: V2 = [HIP_NEAR[0], HIP_NEAR[1] + LT];
const ANKLE_FAR: V2 = [HIP_FAR[0], HIP_FAR[1] + LT];
/** Perched height, head top to toes, in bird units. `size` maps to this. */
const BIRD_H = 41;

const S_NEAR: V2 = [-9.5, -7.6];
const S_FAR: V2 = [-7, -9.2];
const FOLD_A = 9.6;
const FOLD_B = 0.9;
const LA = 17.5;
/** Extended feathers are drawn longer than folded ones (they overlap when folded). */
const EXT_LEN = 1.22;
const CAM = 10 * DEG;
const CHORD3: V3 = [1, 0.06, 0];
const SPAN_F: V2 = norm2([0.985, 0.15]);
const WID_F: V2 = norm2([0.3, 0.954]);

// Wing layout in (a, b): a along the span in units of LA, b along the chord.
const COVERT: V2[] = [
  [-0.12, -1.5],
  [0.35, -2.4],
  [0.8, -2.1],
  [1.15, -1.3],
  [1.32, 0.1],
  [1.12, 3.2],
  [0.62, 6.2],
  [0.15, 8],
  [-0.12, 5],
];
const SECONDARIES = [
  {a: 0.25, b: 3.4, w: 0.03, fold: 0.2, len: 12, hw: 2.9},
  {a: 0.47, b: 3.4, w: 0.06, fold: 0.16, len: 12.5, hw: 2.9},
  {a: 0.69, b: 3.2, w: 0.1, fold: 0.12, len: 12.5, hw: 2.9},
  {a: 0.9, b: 3.0, w: 0.15, fold: 0.08, len: 12, hw: 2.8},
];
const PRIMARIES = [
  {a: 1.42, b: 0, open: 0.8, shut: 0.55, fold: -0.08, len: 15, hw: 2.5},
  {a: 1.34, b: 0.3, open: 0.66, shut: 0.5, fold: -0.06, len: 16.5, hw: 2.5},
  {a: 1.26, b: 0.6, open: 0.54, shut: 0.45, fold: -0.04, len: 17, hw: 2.5},
  {a: 1.18, b: 0.9, open: 0.42, shut: 0.4, fold: -0.02, len: 16.5, hw: 2.5},
  {a: 1.1, b: 1.2, open: 0.32, shut: 0.35, fold: 0, len: 15.5, hw: 2.5},
  {a: 1.02, b: 1.5, open: 0.22, shut: 0.3, fold: 0.02, len: 14, hw: 2.5},
];

const project = (v: V3, far: boolean): V2 => [v[0], v[1] * Math.cos(CAM) + (far ? -v[2] : v[2]) * Math.sin(CAM)];
const span3 = (w: Wing): V3 => {
  const e = w.e * DEG;
  const s = w.sweep * DEG;
  return [Math.sin(s), -Math.sin(e) * Math.cos(s), Math.cos(e) * Math.cos(s)];
};

type WingGeo = {
  covert: string;
  secondaries: [V2, V2, number][];
  primaries: [V2, V2, number][];
  edge: [V2, V2][];
  /** 0 when folded: feather separation lines go quiet. */
  open: number;
};

/** Near and far wings share one construction: an extended (projected 3D) pose blended with a folded pose. */
const buildWing = (arm: Wing, sec: Wing, pri: Wing, far: boolean): WingGeo => {
  const S: V2 = add2(far ? S_FAR : S_NEAR, [0, -arm.lift]);
  const sp = span3(arm);
  const spP = project(sp, far);
  const vis = Math.max(0.5, len2(spP));
  const pt = (a: number, b: number, spread: number): V2 => {
    const ext = add2(add2(S, spP, a * LA), project(CHORD3, far), b);
    const fold = add2(add2(S, SPAN_F, a * FOLD_A), WID_F, b * FOLD_B);
    return lerp2(fold, ext, spread);
  };
  const dirOf = (w: Wing, weight: number, foldBias: number, spread: number): V2 => {
    const s3 = span3(w);
    const d3 = norm3([mix(CHORD3[0], s3[0], weight), mix(CHORD3[1], s3[1], weight), mix(CHORD3[2], s3[2], weight)]);
    return lerp2(norm2(add2(SPAN_F, WID_F, foldBias)), project(d3, far), spread);
  };
  const covert = smooth(COVERT.map(([a, b]) => pt(a, b, arm.spreadS)));
  const secondaries = SECONDARIES.map((s): [V2, V2, number] => {
    const r = pt(s.a, s.b, arm.spreadS);
    const d = dirOf(sec, s.w, s.fold, sec.spreadS);
    return [r, add2(r, d, s.len * mix(0.85, EXT_LEN, sec.spreadS)), s.hw * mix(1, vis * 1.15, arm.spreadS)];
  });
  const primaries = PRIMARIES.map((p): [V2, V2, number] => {
    const r = pt(p.a, p.b, arm.spreadS);
    const d = dirOf(pri, mix(p.shut, p.open, pri.prim), p.fold, pri.spreadP);
    return [r, add2(r, d, p.len * mix(0.9, EXT_LEN, pri.spreadP)), p.hw * mix(1, vis * 1.15, pri.spreadP)];
  });
  const edge: [V2, V2][] = [[pt(0.08, 7.6, arm.spreadS), pt(0.98, 2.8, arm.spreadS)]];
  return {covert, secondaries, primaries, edge, open: Math.max(arm.spreadS, pri.spreadP)};
};

// ─── legs & feet ────────────────────────────────────────────────────────────
type Toe = {ang: number; len: number; curl: number};
type Leg = {hip: V2; ankle: V2; rot: number; open: number; grip: number; vis: number};
const TOES_CLOSED: Toe[] = [
  {ang: 112, len: 2, curl: 0.4},
  {ang: 98, len: 1.9, curl: 0.4},
  {ang: 62, len: 1.7, curl: 0.3},
];
const TOES_OPEN: Toe[] = [
  {ang: 172, len: 4.4, curl: 0},
  {ang: 152, len: 4, curl: 0},
  {ang: 18, len: 3.4, curl: 0},
];
const TOES_GRIP: Toe[] = [
  {ang: 164, len: 4.4, curl: 1},
  {ang: 146, len: 4, curl: 1},
  {ang: 30, len: 2.9, curl: 1},
];

// ─── pose ───────────────────────────────────────────────────────────────────
export type SparrowPose = {
  x: number;
  y: number;
  k: number;
  opacity: number;
  pitch: number;
  sx: number;
  sy: number;
  headRel: number;
  headDy: number;
  env: number;
  tailRel: number;
  tailFan: number;
  near: [Wing, Wing, Wing];
  far: [Wing, Wing, Wing];
  farOpacity: number;
  legNear: Leg;
  legFar: Leg;
  blink: number;
  lod: number;
  smear: number;
};

/**
 * Full pose at `local` seconds after the flight cue. `perch` is where the near
 * foot grips (top of the letter); `size` is the perched height in px.
 */
export const sparrowPose = (local: number, perch: Pt, size: number, textIn = 1): SparrowPose => {
  const l = local;
  const k = size / BIRD_H;
  const tn = clamp01(l / FLY_DUR);
  const rest: V2 = [perch[0] - k * ANKLE_NEAR[0], perch[1] - k * (ANKLE_NEAR[1] + TOE_DROP)];

  const path = flightPath(l);
  const bob = wingBob(l);
  const dip =
    l > T1
      ? keys(l, [
          [T1, 0],
          [T1 + 0.09, 1.6],
          [T1 + 0.21, -0.6],
          [T1 + 0.33, 0.15],
          [T1 + 0.45, 0],
        ])
      : 0;
  const com: V2 = [path[0], path[1] + bob + dip];

  const v = vel(l);
  const speed = Math.hypot(v[0], v[1]);
  const smear = clamp01((speed - 470) / 90) * (1 - sm(0.8, 0.9, tn));
  const lod = 1 - 0.85 * smear;

  const bodyPitch = pitch(l);
  const bank = roll(l);

  const squash =
    l > T1
      ? keys(l, [
          [T1, 1],
          [T1 + 0.07, 0.974],
          [T1 + 0.19, 1.007],
          [T1 + 0.32, 0.999],
          [T1 + 0.42, 1],
        ])
      : 1;
  const breath = 1 + 0.006 * Math.sin(Math.PI * clamp01((l - 2.4) / 0.5)) ** 2;
  const sy = squash * breath * (1 - 0.015 * smear);
  const sx = (1 + (1 - squash) * 0.5) * (1 + 0.02 * smear);

  const headRel = soft(headWorld(l) - bodyPitch, 18);
  const headDy = (-bob * 0.55) / k;

  // Envelope: lags the head's rotation and swings a little against the body's vertical acceleration.
  const hLag = (headWorld(l - 0.06) - headWorld(l)) * 0.7;
  const dt = 1 / 60;
  const accY = l < T1 - 0.2 ? (wingBob(l + dt) - 2 * wingBob(l) + wingBob(l - dt)) / (dt * dt) : 0;
  const settleEnv = l > T1 ? 2.6 * Math.exp(-(l - T1) / 0.13) * Math.sin((2 * Math.PI * (l - T1)) / 0.28) : 0;
  const env = -11 + soft(hLag - accY * 0.0015, 4) + settleEnv;

  const brake = sm(T1 - 0.3, T1 - 0.12, l) * (1 - sm(T1, T1 + 0.22, l));
  const perched = sm(T1 + 0.05, T1 + 0.35, l);
  const tailRel =
    soft((pitch(l - 0.05) - bodyPitch) * 1.6, 8) -
    2 * smear +
    brake * 9 +
    perched * 8 +
    2 * bump(T1 + 0.02, T1 + 0.1, T1 + 0.3, l);
  const tailFan = mix(mix(0.25, 0.05, smear), 1, brake) * (1 - perched * 0.8);

  const withRoll = (w: Wing, r: number): Wing => ({...w, e: w.e + r});
  const near: [Wing, Wing, Wing] = [
    withRoll(wingAt(l), bank * 0.8),
    withRoll(wingAt(l - 0.012), bank * 0.8),
    withRoll(wingAt(l - 0.03), bank * 0.8),
  ];
  const fl = l - 0.035;
  const far: [Wing, Wing, Wing] = [
    withRoll(wingAt(fl, true), -bank * 0.8),
    withRoll(wingAt(fl - 0.012, true), -bank * 0.8),
    withRoll(wingAt(fl - 0.03, true), -bank * 0.8),
  ];
  const farOpacity = clamp(0.6 + bank * 0.012, 0.48, 0.7) * (fl < T1 ? 1 : sm(0.55, 0.95, far[0].spreadS));

  const bodyX = (p: V2): V2 => rot2([p[0] * sx, PIV + (p[1] - PIV) * sy], bodyPitch);
  const legDown = sm(0.8, 0.9, tn);
  const reach = sm(0.93, 0.98, tn) * (1 - sm(T1 - 0.02, T1 + 0.1, l));
  const open = sm(0.88, 0.94, tn);
  const leg = (hip: V2, ankleRest: V2, tc: number): Leg => {
    const a = mix(mix(-85, 0, legDown), 20, reach);
    const len = mix(4, LT, legDown);
    const fk = bodyX(add2(hip, [-Math.sin(a * DEG), Math.cos(a * DEG)], len));
    const contact: V2 = [ankleRest[0] - com[0] / k, ankleRest[1] - com[1] / k];
    const grab = sm(tc - 0.1, tc, l);
    return {
      hip: bodyX(hip),
      ankle: lerp2(fk, contact, grab),
      rot: mix(bodyPitch + a * 0.5, 0, grab),
      open,
      grip: sm(tc, tc + 0.08, l),
      vis: mix(0.55, 1, legDown),
    };
  };

  const blinkT = l - 2.48;
  const blink = blinkT > 0 && blinkT < 0.09 ? Math.sin((blinkT / 0.09) * Math.PI) : 0;

  return {
    x: rest[0] + com[0],
    y: rest[1] + com[1],
    k,
    opacity: l < 0 ? 0 : Math.min(1, sm(0, 0.12, tn) * 3) * (0.25 + 0.75 * textIn),
    pitch: bodyPitch,
    sx,
    sy,
    headRel,
    headDy,
    env,
    tailRel,
    tailFan,
    near,
    far,
    farOpacity,
    legNear: leg(HIP_NEAR, ANKLE_NEAR, T1),
    legFar: leg(HIP_FAR, ANKLE_FAR, T2),
    blink,
    lod,
    smear,
  };
};

// ─── drawing ────────────────────────────────────────────────────────────────
const BODY_PTS: V2[] = [
  [-15, -12.4],
  [-6, -11.6],
  [4, -10],
  [12, -7.6],
  [18.5, -4.6],
  [22.5, -2.4],
  [21.5, 0.4],
  [15, 4.8],
  [6, 9.6],
  [-6, 11.2],
  [-16, 9.6],
  [-23.8, 4.4],
  [-26.2, -1.2],
  [-23, -8],
];
const BODY = smooth(BODY_PTS);
const THROAT = smooth([
  [-31, -12],
  [-19, -9.5],
  [-15.5, -5.5],
  [-20, -1.6],
  [-31, -1],
]);
const CHEST = smooth([
  [-34, -6],
  [-20, -4.6],
  [-13, 0],
  [-7.5, 6],
  [-2, 16],
  [-34, 16],
]);
const BELLY = smooth([
  [-20, 8.6],
  [-11, 6.2],
  [0, 5.6],
  [11, 5.4],
  [19, 3.6],
  [22, 14],
  [-20, 16],
]);
const HEAD =
  'M-30 -17.1 C-29 -22.3 -24.5 -25 -19.5 -25 C-13.5 -25 -9.2 -20.6 -9.2 -15.3 ' +
  'C-9.2 -10.3 -12.5 -6 -18 -5.4 C-23 -5 -27.5 -7 -29.4 -10.4 C-30.2 -12.4 -30.5 -14.8 -30 -17.1 Z';
const CHEEK = smooth([
  [-28.6, -10.2],
  [-24.5, -10.4],
  [-19.5, -8.8],
  [-15.5, -6.4],
  [-20.5, -5],
  [-26.2, -6.3],
]);
const EYE: V2 = [-23.6, -16.9];
const GAPE: V2 = [-31.6, -13.4];
const ENV_ANCHOR: V2 = [10.6, 1.3];

const TailRig: React.FC<{rel: number; fan: number; lod: number; blur?: string}> = ({rel, fan, lod, blur}) => {
  const spreadDeg = mix(2, 14, fan);
  const feathers = [
    {o: 1, off: 1.1, len: 15, fill: INK.tailOuter},
    {o: -1, off: -1.1, len: 15.5, fill: INK.tailOuter},
    {o: 0.36, off: 0.4, len: 17.5, fill: INK.tailInner},
    {o: -0.36, off: -0.4, len: 17.5, fill: INK.tailInner},
  ];
  return (
    <g transform={`rotate(${f(4 + rel)} ${TAIL[0]} ${TAIL[1]})`} filter={blur}>
      {feathers.map((t, i) => {
        const r: V2 = [TAIL[0], TAIL[1] + t.off];
        const tip = add2(r, rot2([1, 0], t.o * spreadDeg), t.len);
        return (
          <g key={i}>
            <path d={featherPath(r, tip, 2.3, 1)} fill={t.fill} />
            {lod > 0.35 && (
              <path
                d={`M${f(mix(r[0], tip[0], 0.2))} ${f(mix(r[1], tip[1], 0.2) - 0.9)} L${f(mix(r[0], tip[0], 0.86))} ${f(mix(r[1], tip[1], 0.86) - 0.5)}`}
                stroke={INK.edge}
                strokeWidth={0.32}
                strokeLinecap="round"
                opacity={0.55 * lod}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};

const WingRig: React.FC<{geo: WingGeo; lod: number; blur?: string}> = ({geo, lod, blur}) => (
  <>
    <g filter={blur}>
      {geo.primaries
        .slice()
        .reverse()
        .map(([r, t, hw], i) => (
          <path key={i} d={featherPath(r, t, hw, 0.45)} fill={i % 2 ? INK.primaryAlt : INK.primary} />
        ))}
      {lod > 0.3 &&
        geo.primaries.map(([r, t], i) => (
          <path
            key={`e${i}`}
            d={`M${f(mix(r[0], t[0], 0.35))} ${f(mix(r[1], t[1], 0.35))} L${f(mix(r[0], t[0], 0.9))} ${f(mix(r[1], t[1], 0.9))}`}
            stroke={INK.edge}
            strokeWidth={0.3}
            strokeLinecap="round"
            opacity={0.5 * lod * mix(i % 2 ? 0.7 : 0, 1, geo.open)}
          />
        ))}
    </g>
    {geo.secondaries
      .slice()
      .reverse()
      .map(([r, t, hw], i) => (
        <path key={i} d={featherPath(r, t, hw)} fill={INK.secondary} />
      ))}
    {lod > 0.3 &&
      geo.secondaries.map(([r, t], i) => (
        <path
          key={`s${i}`}
          d={`M${f(mix(r[0], t[0], 0.3))} ${f(mix(r[1], t[1], 0.3))} L${f(mix(r[0], t[0], 0.88))} ${f(mix(r[1], t[1], 0.88))}`}
          stroke={INK.primary}
          strokeWidth={0.35}
          strokeLinecap="round"
          opacity={0.45 * lod * mix(i % 2 ? 0 : 0.8, 1, geo.open)}
        />
      ))}
    <path d={geo.covert} fill={INK.covert} />
    {lod > 0.3 &&
      geo.edge.map(([a, b], i) => (
        <path
          key={i}
          d={`M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])}`}
          stroke={INK.edge}
          strokeWidth={0.45}
          strokeLinecap="round"
          opacity={0.55 * lod * mix(0.35, 1, geo.open)}
        />
      ))}
  </>
);

const FootRig: React.FC<{leg: Leg; far?: boolean; lod: number}> = ({leg, far, lod}) => {
  const toes = TOES_CLOSED.map((c, i): Toe => {
    const o = TOES_OPEN[i];
    const g = TOES_GRIP[i];
    const a: Toe = {ang: mix(c.ang, o.ang, leg.open), len: mix(c.len, o.len, leg.open), curl: mix(c.curl, o.curl, leg.open)};
    return {ang: mix(a.ang, g.ang, leg.grip), len: mix(a.len, g.len, leg.grip), curl: mix(a.curl, g.curl, leg.grip)};
  });
  const A = leg.ankle;
  const color = far ? '#2B2F3C' : INK.leg;
  return (
    <g opacity={leg.vis * mix(0.6, 1, lod)}>
      <path d={`M${f(leg.hip[0])} ${f(leg.hip[1])} L${f(A[0])} ${f(A[1])}`} stroke={color} strokeWidth={far ? 1.2 : 1.35} strokeLinecap="round" />
      {toes.map((t, i) => {
        const base = t.ang + leg.rot;
        const tipAng = base + (90 - base) * t.curl * 0.4;
        const c = add2(A, [Math.cos(base * DEG), Math.sin(base * DEG)], t.len * 0.55);
        const tip = add2(A, [Math.cos(tipAng * DEG), Math.sin(tipAng * DEG)], t.len);
        return (
          <path
            key={i}
            d={`M${f(A[0])} ${f(A[1])} Q${f(c[0])} ${f(c[1])} ${f(tip[0])} ${f(tip[1])}`}
            stroke={color}
            strokeWidth={i === 2 ? 0.95 : 1.05}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </g>
  );
};

const HeadRig: React.FC<{rel: number; dy: number; env: number; blink: number; lod: number; id: string}> = ({
  rel,
  dy,
  env,
  blink,
  lod,
  id,
}) => (
  <g transform={`translate(0 ${f(dy)}) rotate(${f(rel)} ${NECK[0]} ${NECK[1]})`}>
    <clipPath id={`${id}-head`}>
      <path d={HEAD} />
    </clipPath>
    {/* Envelope sits in the gape; both mandibles are drawn over it. */}
    <g transform={`translate(${GAPE[0]} ${GAPE[1]}) rotate(${f(env)}) translate(${-ENV_ANCHOR[0]} ${-ENV_ANCHOR[1]})`}>
      <rect x={0} y={0} width={12} height={8.2} rx={0.8} fill={C.card} stroke={C.ink} strokeWidth={0.5} />
      {lod > 0.35 && (
        <path d="M0.45 0.5 L4.7 4.5 L7.3 4.5 L11.55 0.5" fill="none" stroke={C.ink} strokeWidth={0.42} strokeLinejoin="round" opacity={0.9 * mix(0.5, 1, lod)} />
      )}
      <path d="M0.45 0.5 L4.7 4.5 L7.3 4.5 L11.55 0.5 Z" fill={C.accent} opacity={0.16} />
    </g>
    <path d={HEAD} fill={INK.head} />
    <g clipPath={`url(#${id}-head)`}>
      <path d={CHEEK} fill={INK.cheek} />
      {lod > 0.4 && (
        <path d="M-27.5 -20.3 C-24.5 -23.4 -19 -24.4 -14.5 -22.2" stroke={INK.edge} strokeWidth={0.5} strokeLinecap="round" fill="none" opacity={0.4 * lod} />
      )}
    </g>
    <circle cx={EYE[0]} cy={EYE[1]} r={2.4} fill={INK.eye} />
    <circle cx={EYE[0] - 0.3} cy={EYE[1]} r={1.62} fill={INK.pupil} />
    <circle cx={EYE[0] - 0.85} cy={EYE[1] - 0.6} r={0.36} fill="#FFFFFF" opacity={mix(0.35, 1, lod)} />
    {blink > 0 && <ellipse cx={EYE[0]} cy={EYE[1] - 2.6 * (1 - blink)} rx={2.8} ry={2.7 * blink} fill={INK.head} />}
    <path d="M-29.6 -10.7 L-35.6 -13.1 L-30.6 -13.3 Z" fill={INK.beakBottom} />
    <path d="M-30.2 -17.1 C-32.8 -16.6 -35.5 -15.3 -37.8 -13.8 L-30.6 -13.3 Z" fill={INK.beakTop} />
  </g>
);

/** The whole bird as SVG, in page coordinates. `ghost` drops all detail. */
export const SparrowFigure: React.FC<{pose: SparrowPose; id: string; ghost?: boolean}> = ({pose, id, ghost}) => {
  const lod = ghost ? 0 : pose.lod;
  const body = `rotate(${f(pose.pitch)}) translate(0 ${PIV}) scale(${f(pose.sx)} ${pose.sy.toFixed(4)}) translate(0 ${-PIV})`;
  const blurOn = !ghost && pose.smear > 0.04;
  const blur = blurOn ? `url(#${id}-mb)` : undefined;
  const nearGeo = buildWing(pose.near[0], pose.near[1], pose.near[2], false);
  const farGeo = buildWing(pose.far[0], pose.far[1], pose.far[2], true);
  return (
    <g transform={`translate(${f(pose.x)} ${f(pose.y)}) scale(${pose.k.toFixed(4)})`}>
      <defs>
        {blurOn && (
          <filter id={`${id}-mb`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={`${f(1.5 * pose.smear)} ${f(0.25 * pose.smear)}`} />
          </filter>
        )}
        <clipPath id={`${id}-body`}>
          <path d={BODY} />
        </clipPath>
      </defs>
      {pose.farOpacity > 0.01 && (
        <g transform={body} opacity={pose.farOpacity}>
          <g transform={`translate(${S_FAR[0]} ${S_FAR[1]}) scale(0.86) translate(${-S_FAR[0]} ${-S_FAR[1]})`}>
            <WingRig geo={farGeo} lod={lod * 0.6} blur={blur} />
          </g>
        </g>
      )}
      <FootRig leg={pose.legFar} far lod={lod} />
      <g transform={body}>
        <TailRig rel={pose.tailRel} fan={pose.tailFan} lod={lod} blur={blur} />
      </g>
      <FootRig leg={pose.legNear} lod={lod} />
      <g transform={body}>
        <path d={BODY} fill={INK.back} />
        <g clipPath={`url(#${id}-body)`}>
          <path d={THROAT} fill={INK.cheek} />
          <path d={CHEST} fill={INK.chest} />
          <path d={BELLY} fill={INK.belly} />
          {lod > 0.4 && (
            <>
              <path d="M-22.6 0.6 L-20.2 1.4 M-21.4 4.2 L-18.8 5 M-17.4 2.6 L-15 3.4" stroke="#62677A" strokeWidth={0.5} strokeLinecap="round" fill="none" opacity={0.6 * lod} />
            </>
          )}
        </g>
        <WingRig geo={nearGeo} lod={lod} blur={blur} />
        <HeadRig rel={pose.headRel} dy={pose.headDy} env={pose.env} blink={pose.blink} lod={lod} id={id} />
      </g>
    </g>
  );
};

export const SparrowFlight: React.FC<{t: number; startAt: number; perch: Pt; textIn: number; size?: number}> = ({
  t,
  startAt,
  perch,
  textIn,
  size = 62,
}) => {
  const local = t - startAt;
  const now = sparrowPose(local, perch, size, textIn);
  if (now.opacity <= 0.02) return null;
  const ghosts = now.smear > 0.3 ? [0.016, 0.032].map((dt) => sparrowPose(local - dt, perch, size, textIn)) : [];
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}
    >
      {ghosts.map((g, i) => (
        <g key={i} opacity={(i === 0 ? 0.07 : 0.03) * sm(0.3, 1, now.smear) * now.opacity}>
          <SparrowFigure pose={g} id={`sparrow-ghost-${i}`} ghost />
        </g>
      ))}
      <g opacity={now.opacity}>
        <SparrowFigure pose={now} id="sparrow" />
      </g>
    </svg>
  );
};
