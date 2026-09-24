import React from 'react';
import {C} from '../theme';
import {curvePath, curvePoint, Pt} from '../motion/transitions';

/**
 * Thin indigo S-curve between two stage points.
 * `progress` draws it on (0..1); `pulse` (0..1 or null) sends a small light along it.
 */
export const ConnectionLine: React.FC<{
  from: Pt;
  to: Pt;
  progress?: number;
  opacity?: number;
  width?: number;
  bend?: number;
  pulse?: number | null;
  color?: string;
  endDots?: boolean;
}> = ({from, to, progress = 1, opacity = 1, width = 1.25, bend = 0.5, pulse = null, color = C.accent, endDots = true}) => {
  if (progress <= 0 || opacity <= 0) return null;
  const d = curvePath(from, to, bend);
  const p = pulse !== null && pulse > 0 && pulse < 1 ? curvePoint(from, to, pulse, bend) : null;
  const end = curvePoint(from, to, Math.min(1, progress), bend);
  return (
    <svg
      width={1920}
      height={1080}
      style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
        opacity={opacity * 0.75}
      />
      {endDots && (
        <>
          <circle cx={from[0]} cy={from[1]} r={3} fill={color} opacity={opacity} />
          {progress > 0.98 && <circle cx={end[0]} cy={end[1]} r={3} fill={color} opacity={opacity} />}
        </>
      )}
      {p && (
        <>
          <circle cx={p[0]} cy={p[1]} r={18} fill={color} opacity={0.14} />
          <circle cx={p[0]} cy={p[1]} r={5.5} fill={color} />
        </>
      )}
    </svg>
  );
};
