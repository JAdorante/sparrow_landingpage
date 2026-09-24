import React from 'react';
import {C} from '../theme';
import {clamp01, mix, Pt} from '../motion/transitions';

/**
 * Living interruption, not a sticker on a curve.
 * Center-of-mass follows a cubic; everything else is its own system.
 *
 * 0.00–0.35  entry (already mid-downstroke)
 * 0.35–0.75  climb
 * 0.75–1.20  sweep / max speed
 * 1.20–1.50  line up with the m
 * 1.50–1.70  flare
 * 1.70–1.83  feet reach
 * 1.83 / 1.88  left then right contact
 * 1.88–2.30  compress + rebound
 * 2.30+      one blink, then breath only
 */
export const FLY_DUR = 1.83;

const cubic = (a: Pt, c1: Pt, c2: Pt, b: Pt, u: number): Pt => {
  const v = 1 - u;
  return [
    v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0],
    v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1],
  ];
};

const sm = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / Math.max(1e-6, b - a));
  return t * t * (3 - 2 * t);
};

const keys = (x: number, pts: [number, number][]) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const u = sm(pts[i - 1][0], pts[i][0], x);
      return mix(pts[i - 1][1], pts[i][1], u);
    }
  }
  return pts[pts.length - 1][1];
};

/** Path u from normalized flight time — fastest in the sweep, not at entry. */
const pathU = (tn: number) =>
  keys(tn, [
    [0, 0],
    [0.12, 0.16],
    [0.35, 0.4],
    [0.55, 0.68],
    [0.7, 0.8],
    [0.82, 0.875],
    [0.91, 0.93],
    [0.96, 0.975],
    [1, 1],
  ]);

const inWin = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-6, b - a));

/** 0 = tucked down, 1 = high. Beats have purpose, not a loop. */
const wingBeats = (local: number) => {
  let near = 0.12;
  let farAmp = 1;
  if (local < 0.35) {
    const u = inWin(local, 0, 0.35);
    near = u < 0.5 ? mix(0.42, 0.02, sm(0, 0.5, u)) : mix(0.02, 0.48, sm(0.5, 1, u));
  } else if (local < 0.75) {
    const u = inWin(local, 0.35, 0.75);
    near = u < 0.36 ? mix(0.48, 1, sm(0, 0.36, u)) : mix(1, 0.04, sm(0.36, 1, u));
  } else if (local < 1.2) {
    const u = inWin(local, 0.75, 1.2);
    near = u < 0.38 ? mix(0.2, 0.72, sm(0, 0.38, u)) : mix(0.72, 0.16, sm(0.38, 1, u));
  } else if (local < 1.5) {
    const u = inWin(local, 1.2, 1.5);
    farAmp = 0.82;
    near = u < 0.4 ? mix(0.22, 0.86, sm(0, 0.4, u)) : mix(0.86, 0.14, sm(0.4, 1, u));
  } else if (local < 1.83) {
    const u = inWin(local, 1.5, 1.83);
    near = u < 0.35 ? mix(0.2, 0.9, sm(0, 0.35, u)) : mix(0.9, 0.86, sm(0.35, 1, u));
  } else {
    near = mix(0.86, 0.1, sm(1.83, 2.2, local));
  }
  return {near, far: near * farAmp};
};

export type SparrowPose = {
  x: number;
  y: number;
  bodyRot: number;
  headRel: number;
  tail: number;
  env: number;
  near: number;
  far: number;
  tipLag: number;
  sx: number;
  sy: number;
  chest: number;
  opacity: number;
  shadow: number;
  shadowBlur: number;
  shadowScale: number;
  leftLeg: number;
  rightLeg: number;
  leftToe: number;
  rightToe: number;
  blink: number;
  lod: number;
  smear: number;
  perched: number;
};

export const sparrowPose = (t: number, startAt: number, perch: Pt, textIn: number): SparrowPose => {
  const local = t - startAt;
  const tn = clamp01(local / FLY_DUR);
  const u = pathU(tn);
  const from: Pt = [perch[0] + 560, perch[1] - 36];
  const c1: Pt = [perch[0] + 330, perch[1] - 248];
  const c2: Pt = [perch[0] + 108, perch[1] - 58];
  const along = cubic(from, c1, c2, perch, u);
  const lookA = cubic(from, c1, c2, perch, Math.max(0, u - 0.02));
  const lookB = cubic(from, c1, c2, perch, Math.min(1, u + 0.02));
  const vx = lookB[0] - lookA[0];
  const vy = lookB[1] - lookA[1];
  const speed = Math.hypot(vx, vy);
  const heading = (Math.atan2(vy, vx) * 180) / Math.PI;
  const rawBank = Math.max(-28, Math.min(24, 180 - heading));

  const lagU = pathU(clamp01((local - 0.05) / FLY_DUR));
  const lag = cubic(from, c1, c2, perch, lagU);
  const lagH = (Math.atan2(along[1] - lag[1], along[0] - lag[0]) * 180) / Math.PI;
  const lagBank = Math.max(-28, Math.min(24, 180 - lagH));
  const settle = sm(1.83, 2.28, local);
  const bodyRot = mix(mix(lagBank, rawBank, 0.5), 0, settle);

  const correct = tn > 0.82 && tn < 0.96 ? -Math.sin(sm(0.82, 0.96, tn) * Math.PI) * 5 : 0;
  const contactDip = local > 1.83 ? Math.sin(sm(1.83, 2.22, local) * Math.PI) * 1.6 * (1 - sm(2.05, 2.3, local)) : 0;

  const lock = sm(0.55, 0.72, tn);
  const dip = -7 * sm(0.78, 0.86, tn) * (1 - sm(0.88, 0.96, tn));
  const lift = 4 * sm(0.88, 0.96, tn) * (1 - settle);
  const toM = (Math.atan2(perch[1] - along[1], perch[0] - along[0]) * 180) / Math.PI;
  const look = Math.max(-16, Math.min(12, 180 - toM));
  const headRel = mix(-bodyRot * 0.35, look - bodyRot, lock) + dip + lift;
  const landHead = local > 2.28 && local < 2.55 ? mix(1.5, 0, sm(2.28, 2.55, local)) : 0;

  const tailDelay = pathU(clamp01((local - 0.05) / FLY_DUR));
  const tailPt = cubic(from, c1, c2, perch, tailDelay);
  const tailH = (Math.atan2(along[1] - tailPt[1], along[0] - tailPt[0]) * 180) / Math.PI;
  const tailBank = Math.max(-28, Math.min(24, 180 - tailH));
  const tail = mix(-tailBank * 0.4, 0, settle);

  const envDelay = mix(headRel, 0, 0.15) + (local > 1.5 ? 2.2 * (1 - settle) : 0);
  const envSettle = local > 2.28 ? (local < 2.42 ? mix(1.5, -0.7, sm(2.28, 2.42, local)) : mix(-0.7, 0, sm(2.42, 2.58, local))) : 0;

  const {near, far} = wingBeats(local);
  const tipLag = wingBeats(local - 0.055).near - near;

  const stretch = 1 + Math.min(0.025, speed * 0.0018) * (1 - settle);
  let sx = stretch;
  let sy = 1 / stretch;
  if (local > 1.83 && local < 2.05) {
    const k = sm(1.83, 2.05, local);
    sx = mix(1.015, 0.995, k);
    sy = mix(0.97, 1.01, k);
  } else if (local >= 2.05) {
    const k = sm(2.05, 2.3, local);
    sx = mix(0.995, 1, k);
    sy = mix(1.01, 1, k);
  }
  const breath = local > 2.32 ? 1 + 0.008 * Math.sin(((local - 2.32) / 1.3) * Math.PI * 2) * 0.5 * (1 + Math.sin(((local - 2.32) / 1.3) * Math.PI)) : 1;
  const chest = breath;

  const prep = sm(0.78, 0.94, tn);
  const leftLeg = mix(0.08, 1, prep) * (local >= 1.83 ? 1 : mix(0.55, 0.92, sm(1.7, 1.83, local)));
  const rightLeg = mix(0.08, 1, prep) * (local >= 1.88 ? 1 : mix(0.45, 0.88, sm(1.72, 1.88, local)));
  const leftToe = local >= 1.83 ? mix(0.3, 1, sm(1.83, 1.96, local)) : sm(0.86, 0.94, tn) * 0.35;
  const rightToe = local >= 1.88 ? mix(0.3, 1, sm(1.88, 2.02, local)) : sm(0.86, 0.94, tn) * 0.25;

  const blinkWin = local - 2.38;
  const blink = blinkWin > 0 && blinkWin < 0.1 ? Math.sin((blinkWin / 0.1) * Math.PI) : 0;

  const smear = clamp01((speed - 6) / 14) * (1 - settle);
  const lod = 1 - smear * 0.85;
  const landed = sm(1.83, 1.96, local);

  return {
    x: along[0],
    y: along[1] + correct + contactDip,
    bodyRot,
    headRel: headRel + landHead,
    tail,
    env: envDelay + envSettle,
    near,
    far,
    tipLag,
    sx,
    sy,
    chest,
    opacity: local < 0 ? 0 : Math.min(1, sm(0, 0.12, tn) * 3) * (0.25 + 0.75 * textIn),
    shadow: landed * 0.16,
    shadowBlur: mix(5, 2, landed),
    shadowScale: mix(0.6, 1, landed),
    leftLeg,
    rightLeg,
    leftToe,
    rightToe,
    blink,
    lod,
    smear,
    perched: settle,
  };
};

const wingDeg = (p: number) => mix(38, -72, p);

const Feathers: React.FC<{lod: number; accent?: boolean}> = ({lod, accent}) => (
  <>
    <path d="M39 29 C45 12 54 -4 66 -12 C56 2 46 16 39 30 Z" fill={C.ink} />
    <path d="M39 30 C47 14 58 0 72 -6 C60 8 48 20 39 31 Z" fill={C.ink} />
    <path d="M39 31 C48 18 62 6 78 2 C64 12 50 22 39 32 Z" fill={C.ink} opacity={0.96} />
    <path d="M39 32 C50 22 66 14 84 12 C68 18 52 26 39 33 Z" fill={C.ink} opacity={0.9} />
    <path d="M39 33 C50 26 66 22 82 24 C66 24 52 28 39 33 Z" fill={C.ink} opacity={0.82} />
    {lod > 0.35 && (
      <>
        {accent && <path d="M40 28 L66 -12" stroke={C.accent} strokeWidth="0.85" strokeLinecap="round" opacity={0.45 * lod} />}
        <path d="M40 30 L72 -6" stroke={C.bg} strokeWidth="0.7" strokeLinecap="round" opacity={0.28 * lod} />
        <path d="M40 31 L78 2" stroke={C.bg} strokeWidth="0.65" strokeLinecap="round" opacity={0.22 * lod} />
        <path d="M40 32 L84 12" stroke={C.bg} strokeWidth="0.6" strokeLinecap="round" opacity={0.16 * lod} />
        <path d="M42 27 C48 22 54 19 61 18" stroke={C.bg} strokeWidth="1.15" strokeLinecap="round" opacity={0.28 * lod} />
        <path d="M43 30 C50 26 57 24 65 24" stroke={C.bg} strokeWidth="1.05" strokeLinecap="round" opacity={0.24 * lod} />
        <path d="M44 33 C51 30 58 29 67 29" stroke={C.bg} strokeWidth="0.9" strokeLinecap="round" opacity={0.2 * lod} />
        <path d="M48 18 C52 16 56 15 61 15" stroke={C.slate} strokeWidth="0.7" strokeLinecap="round" opacity={0.42 * lod} />
        <path d="M52 11 C56 9 59 8 63 8" stroke={C.slate} strokeWidth="0.65" strokeLinecap="round" opacity={0.34 * lod} />
      </>
    )}
  </>
);

const SparrowMark: React.FC<SparrowPose & {size?: number}> = ({
  x,
  y,
  bodyRot,
  headRel,
  tail,
  env,
  near,
  far,
  tipLag,
  sx,
  sy,
  chest,
  opacity,
  shadow,
  shadowBlur,
  shadowScale,
  leftLeg,
  rightLeg,
  leftToe,
  rightToe,
  blink,
  lod,
  smear,
  perched,
  size = 80,
}) => {
  if (opacity <= 0.02) return null;
  const w = size * 1.2;
  const h = size * 1.05;
  const nearR = wingDeg(near);
  const farR = wingDeg(far);
  const tipR = tipLag * 22;
  const wingBlur = smear > 0.15 ? `blur(${smear * 0.9}px)` : undefined;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        transform: 'translate(-42%, -88%)',
        pointerEvents: 'none',
      }}
    >
      {shadow > 0.01 && (
        <div
          style={{
            position: 'absolute',
            left: '22%',
            bottom: '-3%',
            width: `${48 * shadowScale}%`,
            height: '11%',
            borderRadius: 99,
            background: `rgba(23,26,35,${shadow})`,
            filter: `blur(${shadowBlur}px)`,
            transform: 'translateX(-10%)',
          }}
        />
      )}
      <svg width={w} height={h} viewBox="-10 -22 100 86" fill="none">
        <g transform={`translate(38 36) rotate(${bodyRot}) scale(${sx} ${sy}) translate(-38 -36)`}>
          <g
            transform={`rotate(${farR} 40 30)`}
            opacity={mix(0.28, 0.5, 1 - Math.abs(bodyRot) / 28) * (1 - perched)}
            style={{filter: wingBlur}}
          >
            <g transform={`rotate(${tipR * 0.7} 62 8)`}>
              <Feathers lod={lod * 0.6} />
            </g>
          </g>
          <g transform={`rotate(${tail} 52 33)`} style={{filter: smear > 0.2 ? `blur(${smear * 0.7}px)` : undefined}}>
            <path d="M48 30 C54 22 60 14 66 10 C60 20 54 28 49 32 Z" fill={C.ink} />
            <path d="M48 32 C56 26 66 22 74 20 C64 28 54 32 49 34 Z" fill={C.ink} opacity={0.92} />
            <path d="M48 33 C56 32 66 34 74 38 C64 36 54 34 49 34 Z" fill={C.ink} opacity={0.8} />
            <path d="M48 34 C55 38 62 44 68 50 C60 42 52 36 49 34 Z" fill={C.ink} opacity={0.7} />
            {lod > 0.4 && (
              <>
                <path d="M49 31 L66 10" stroke={C.bg} strokeWidth="0.55" opacity={0.24 * lod} />
                <path d="M49 33 L74 20" stroke={C.bg} strokeWidth="0.55" opacity={0.18 * lod} />
                <path d="M50 34 L73 38" stroke={C.bg} strokeWidth="0.5" opacity={0.16 * lod} />
                <path d="M50 35 L67 49" stroke={C.bg} strokeWidth="0.5" opacity={0.14 * lod} />
                <path d="M58 19 L62 18" stroke={C.accent} strokeWidth="0.7" strokeLinecap="round" opacity={0.32 * lod} />
                <path d="M62 27 L67 26" stroke={C.accent} strokeWidth="0.65" strokeLinecap="round" opacity={0.24 * lod} />
              </>
            )}
          </g>
          <path
            d="M20.5 29.2 C24 22.2 31.7 19.5 40.7 21 C49.3 22.4 56 27.5 57 32.8 C53.8 39.3 45.9 43.1 36.3 42.5 C27.2 41.9 20.9 37.5 20.5 29.2 Z"
            fill={C.ink}
          />
          <path
            d="M24.2 32 C27.2 27.8 34.2 27.2 41 29.2 C45.8 30.6 49 33.4 49.8 36.2 C45.9 40.5 39 42 32.5 40.5 C27.6 39.4 24.7 36.3 24.2 32 Z"
            fill={C.bg}
            opacity={(0.17 + 0.08 * lod) * chest}
          />
          {lod > 0.45 && (
            <>
              <path d="M25.5 27.1 C31 22.9 40.2 22.6 48.7 26" stroke={C.slate} strokeWidth="1" strokeLinecap="round" opacity={0.46 * lod} />
              <path d="M27 30 C30 28.5 33 29.5 35 31 C37.5 29.2 40.5 28.4 44 29.5" stroke={C.bg} strokeWidth="0.9" strokeLinecap="round" opacity={0.31 * lod} />
              <path d="M26.5 33 C29.5 31.4 32.7 32.2 35.2 34 C37.8 32 41 31.2 45.4 32.4" stroke={C.bg} strokeWidth="0.85" strokeLinecap="round" opacity={0.25 * lod} />
              <path d="M28.2 36 C31.4 34.6 34.3 35.3 36.5 37 C39.2 35.4 42 35 45.7 36" stroke={C.bg} strokeWidth="0.72" strokeLinecap="round" opacity={0.19 * lod} />
              <path d="M50.2 28 C52.3 29.3 53.8 31 54.5 33" stroke={C.accent} strokeWidth="0.8" strokeLinecap="round" opacity={0.32 * lod} />
            </>
          )}
          <g transform={`rotate(${nearR} 40 30)`} opacity={1 - perched} style={{filter: wingBlur}}>
            <g transform={`rotate(${tipR} 64 4)`}>
              <Feathers lod={lod} accent />
            </g>
          </g>
          {perched > 0.01 && (
            <g opacity={perched}>
              <path
                d="M27 25.5 C35.5 20.6 47.8 22.2 53.2 28.7 C49.9 30.1 47.2 32.6 44.5 36.2 C39.2 36.4 33.8 33.5 27 25.5 Z"
                fill={C.ink}
              />
              <path
                d="M29.1 26.5 C35.7 23 44.4 24 50.2 28.4 C44.6 27.4 38.8 28.8 33.6 31.4"
                fill="none"
                stroke={C.slate}
                strokeWidth="1.15"
                strokeLinecap="round"
                opacity={0.72 * lod}
              />
              <path d="M33 28 C38.6 26.5 44.1 27.3 48.5 29.7" stroke={C.bg} strokeWidth="0.9" strokeLinecap="round" opacity={0.42 * lod} />
              <path d="M34 30.8 C38.5 29.7 42.9 30.6 46.2 32.6" stroke={C.bg} strokeWidth="0.82" strokeLinecap="round" opacity={0.34 * lod} />
              <path d="M35.8 33.2 C39.2 32.5 42.2 33.1 44.4 34.6" stroke={C.bg} strokeWidth="0.72" strokeLinecap="round" opacity={0.27 * lod} />
              <path d="M30.2 26.3 C34.1 27.1 36.8 28.8 38.2 31.3" stroke={C.accent} strokeWidth="0.85" strokeLinecap="round" opacity={0.42 * lod} />
              <path d="M39.8 35.5 L52.8 30.1" stroke={C.ink} strokeWidth="1.2" strokeLinecap="round" opacity={0.82} />
              <path d="M41.5 37 L54.4 33.3" stroke={C.ink} strokeWidth="1.05" strokeLinecap="round" opacity={0.65} />
            </g>
          )}
          <g transform={`rotate(${headRel} 24 26)`}>
            <g transform={`translate(-8.5, 20.2) rotate(${-16 + env})`}>
              <rect x="0" y="0" width="16.5" height="11" rx="1.3" fill={C.card} stroke={C.ink} strokeWidth="0.95" />
              {lod > 0.4 && (
                <>
                  <path d="M0.7 0.7 L8.25 6.4 L15.8 0.7" fill="none" stroke={C.ink} strokeWidth="0.8" strokeLinejoin="round" />
                  <path d="M0.7 10.3 L5.8 5.6" stroke={C.ink} strokeWidth="0.55" opacity={0.32} />
                  <path d="M15.8 10.3 L10.7 5.6" stroke={C.ink} strokeWidth="0.55" opacity={0.32} />
                  <path d="M0.6 0.55 L8.25 6.2 L15.9 0.55 Z" fill={C.accent} opacity={0.14} />
                </>
              )}
            </g>
            <path d="M11.3 24.1 C11.6 17.6 16 13.2 21.8 13.7 C27.8 14.3 31.5 19.1 30 25.4 C28.7 30.8 23.6 34 18.1 32.4 C13.5 31.1 10.9 28 11.3 24.1 Z" fill={C.ink} />
            {lod > 0.42 && (
              <>
                <path d="M13.6 19.3 C16.4 15.3 22.1 14.7 26.1 17.4 C21.9 16.7 17.9 17.8 13.6 19.3 Z" fill={C.slate} opacity={0.62 * lod} />
                <path d="M13.2 25 C14.8 22.4 18 21.8 21.1 23.2 C20.1 26.1 17.7 28.2 14.7 28.5 C13.8 27.6 13.3 26.4 13.2 25 Z" fill={C.bg} opacity={0.25 * lod} />
                <path d="M24.4 18.1 C27.2 20.1 28.3 23.1 27.5 26.5" stroke={C.accent} strokeWidth="0.8" strokeLinecap="round" opacity={0.3 * lod} />
                <path d="M20.3 30.5 C22.3 29.8 24.3 28.6 25.6 27" stroke={C.bg} strokeWidth="0.65" strokeLinecap="round" opacity={0.25 * lod} />
              </>
            )}
            <circle cx="16.2" cy="21.4" r="2.55" fill={C.bg} />
            <circle cx="16.35" cy="21.55" r="1.35" fill={C.ink} />
            {lod > 0.5 && <circle cx="15.55" cy="20.85" r="0.45" fill={C.bg} />}
            <rect x="13.7" y="19.2" width="5.2" height={4.4 * blink} rx="2" fill={C.ink} />
            <path d="M11.2 22.4 L1.6 24.1 C1.1 24.3 1.15 25 1.7 25.15 L11.4 27.6 C12.1 27.8 12.7 27.2 12.5 26.5 L11.8 24.8 L12.4 23.2 C12.55 22.7 12 22.25 11.2 22.4 Z" fill={C.accent} />
            {lod > 0.45 && <path d="M2.2 24.6 L10.9 24.3" stroke={C.bg} strokeWidth="0.55" strokeLinecap="round" opacity={0.48 * lod} />}
          </g>
          <g opacity={0.15 + 0.85 * Math.max(leftLeg, rightLeg)}>
            <g transform={`translate(${mix(2, 0, leftLeg)}, ${mix(-7, 0, leftLeg)})`}>
              <path d="M31.5 39.5 C31 42.2 29.6 45 29 47 L31 47.2 C31.4 44.6 32 42 32.2 40 Z" fill={C.ink} />
              {lod > 0.55 && <path d="M30.1 43.1 L31.4 43.3 M29.8 44.8 L31.2 45" stroke={C.bg} strokeWidth="0.42" opacity={0.55 * lod} />}
              <g transform={`rotate(${mix(8, -18, leftToe)} 29 47)`}>
                <path d="M29 47 L26.5 48.4" stroke={C.ink} strokeWidth="1.3" strokeLinecap="round" />
                <path d="M29 47 L28.2 49.2" stroke={C.ink} strokeWidth="1.3" strokeLinecap="round" />
                <path d="M29.5 47.1 L31.3 48.3" stroke={C.ink} strokeWidth="0.85" strokeLinecap="round" />
              </g>
            </g>
            <g transform={`translate(${mix(3, 0, rightLeg)}, ${mix(-7, 0, rightLeg)})`}>
              <path d="M37.6 40.1 C37.8 42.7 38 45.2 38.2 47.4 L40.1 47.2 C39.8 44.7 39.3 42.1 38.8 40.1 Z" fill={C.ink} />
              {lod > 0.55 && <path d="M37.9 43.3 L39.4 43.1 M38 45 L39.7 44.8" stroke={C.bg} strokeWidth="0.42" opacity={0.55 * lod} />}
              <g transform={`rotate(${mix(-6, 16, rightToe)} 38.2 47.4)`}>
                <path d="M38.2 47.4 L40.6 49" stroke={C.ink} strokeWidth="1.3" strokeLinecap="round" />
                <path d="M38.2 47.4 L37.2 49.3" stroke={C.ink} strokeWidth="1.3" strokeLinecap="round" />
                <path d="M38.7 47.4 L40.6 47.8" stroke={C.ink} strokeWidth="0.85" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export const SparrowFlight: React.FC<{t: number; startAt: number; perch: Pt; textIn: number; size?: number}> = ({
  t,
  startAt,
  perch,
  textIn,
  size = 80,
}) => {
  const now = sparrowPose(t, startAt, perch, textIn);
  if (now.opacity <= 0.02) return null;
  return <SparrowMark {...now} size={size} />;
};
