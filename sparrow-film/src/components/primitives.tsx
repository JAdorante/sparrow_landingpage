import React from 'react';
import {C, F, SHADOW} from '../theme';

type Box = {x: number; y: number; w?: number; h?: number};

/** Absolutely positioned layer in 1920×1080 stage space. */
export const Abs: React.FC<
  Box & {style?: React.CSSProperties; children?: React.ReactNode; origin?: string}
> = ({x, y, w, h, style, children, origin}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      transformOrigin: origin ?? 'top left',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Mono voice: uppercase, widely tracked — system state and provenance. */
export const Mono: React.FC<{
  size?: number;
  color?: string;
  track?: number;
  weight?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({size = 15, color = C.slate, track = 0.14, weight = 500, style, children}) => (
  <span
    style={{
      fontFamily: F.mono,
      fontSize: size,
      fontWeight: weight,
      letterSpacing: `${track}em`,
      textTransform: 'uppercase',
      color,
      whiteSpace: 'nowrap',
      lineHeight: 1,
      ...style,
    }}
  >
    {children}
  </span>
);

/** Display voice: heavy grotesk, tight tracking. */
export const displayStyle = (size: number, weight = 700): React.CSSProperties => ({
  fontFamily: F.display,
  fontSize: size,
  fontWeight: weight,
  letterSpacing: size >= 60 ? '-0.035em' : '-0.015em',
  lineHeight: 0.95,
  color: C.ink,
  whiteSpace: 'nowrap',
});

/** Editorial serif voice, used sparingly under major claims. */
export const serifStyle = (size: number, italic = false): React.CSSProperties => ({
  fontFamily: F.serif,
  fontSize: size,
  fontWeight: 400,
  fontStyle: italic ? 'italic' : 'normal',
  letterSpacing: '-0.01em',
  lineHeight: 1.25,
  color: C.slate,
  fontVariationSettings: '"opsz" 72',
});

/** Near-white card: 1px border, soft shadow. `lift` 0..1 fades the fill/shadow in. */
export const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  lift?: number;
  border?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({x, y, w, h, radius = 16, lift = 1, border = 1, style, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: radius,
      background: `rgba(253,253,255,${lift})`,
      boxShadow: lift > 0.01 ? SHADOW.replace(/0\.(\d+)\)/g, (_, d) => `${(Number('0.' + d) * lift).toFixed(3)})`) : 'none',
      border: `1px solid rgba(23,26,35,${0.09 * border})`,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * The film's signature: a thin indigo line that draws around an object
 * (progress 0..1) and then can fade (opacity).
 */
export const SignalBorder: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  progress: number;
  opacity?: number;
  width?: number;
}> = ({x, y, w, h, radius = 16, progress, opacity = 1, width = 1.5}) => {
  if (progress <= 0 || opacity <= 0) return null;
  return (
    <svg
      style={{position: 'absolute', left: x, top: y, overflow: 'visible', pointerEvents: 'none'}}
      width={w}
      height={h}
    >
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={radius}
        fill="none"
        stroke={C.accent}
        strokeWidth={width}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
        opacity={opacity}
      />
    </svg>
  );
};

/** Small status dot (● in the brief). */
export const Dot: React.FC<{size?: number; color?: string; glow?: number; style?: React.CSSProperties}> = ({
  size = 10,
  color = C.accent,
  glow = 0,
  style,
}) => (
  <span
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: size,
      background: color,
      boxShadow: glow ? `0 0 ${12 * glow}px ${3 * glow}px rgba(76,80,217,${0.35 * glow})` : 'none',
      flex: 'none',
      ...style,
    }}
  />
);

/** Initials avatar — abstract, never photographic. */
export const Avatar: React.FC<{initials: string; size: number; tint?: string; ring?: number}> = ({
  initials,
  size,
  tint = '#E4E6FB',
  ring = 0,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: tint,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: F.display,
      fontWeight: 600,
      fontSize: size * 0.34,
      letterSpacing: '0.01em',
      color: C.ink,
      boxShadow: ring ? `0 0 0 ${2}px rgba(76,80,217,${ring}), 0 0 0 ${8}px rgba(76,80,217,${0.08 * ring})` : 'none',
      flex: 'none',
    }}
  >
    {initials}
  </div>
);
