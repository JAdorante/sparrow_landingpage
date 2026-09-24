import React from 'react';
import {displayStyle, serifStyle} from './primitives';
import {tw} from '../motion/transitions';

/**
 * Large headline with an optional serif line underneath.
 * Reveals with a soft rising mask; `out` fades it away.
 */
export const TitleCard: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  t: number;
  at: number;
  out?: number;
  serif?: string;
  serifAt?: number;
  serifSize?: number;
  align?: 'left' | 'center';
  width?: number;
}> = ({x, y, text, size = 112, t, at, out = Infinity, serif, serifAt = Infinity, serifSize = 44, align = 'left', width = 1600}) => {
  const p = tw(t, at, 0.95);
  const o = 1 - tw(t, out, 0.75);
  if (p <= 0 || o <= 0) return null;
  const sp = tw(t, serifAt, 0.85);
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'center' ? x - width / 2 : x,
        top: y,
        width,
        textAlign: align,
        opacity: o,
        transform: `translateY(${(1 - o) * -12}px)`,
      }}
    >
      <div style={{overflow: 'hidden', paddingBottom: size * 0.12, marginBottom: -size * 0.12}}>
        <div
          style={{
            ...displayStyle(size),
            transform: `translateY(${(1 - p) * size * 0.62}px)`,
            opacity: Math.min(1, p * 1.35),
          }}
        >
          {text}
        </div>
      </div>
      {serif && sp > 0 && (
        <div
          style={{
            ...serifStyle(serifSize, true),
            marginTop: size * 0.32,
            opacity: sp,
            transform: `translateY(${(1 - sp) * 10}px)`,
            filter: sp < 1 ? `blur(${(1 - sp) * 4}px)` : undefined,
          }}
        >
          {serif}
        </div>
      )}
    </div>
  );
};
