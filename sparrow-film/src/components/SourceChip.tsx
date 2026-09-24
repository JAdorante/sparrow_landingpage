import React from 'react';
import {C, F} from '../theme';
import {Mono} from './primitives';

/** Small provenance object: kind + title + meta. `hover` 0..1 lights it. */
export const SourceChip: React.FC<{
  x: number;
  y: number;
  w?: number;
  kind?: string;
  title: string;
  meta?: string;
  hover?: number;
  opacity?: number;
  compact?: boolean;
  style?: React.CSSProperties;
}> = ({x, y, w, kind, title, meta, hover = 0, opacity = 1, compact = false, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      opacity,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: compact ? '10px 16px' : '16px 20px',
      borderRadius: 12,
      background: `rgba(${253 - 12 * hover},${253 - 10 * hover},255,1)`,
      border: `1px solid ${hover > 0 ? `rgba(76,80,217,${0.15 + 0.5 * hover})` : C.border}`,
      boxShadow: '0 1px 2px rgba(23,26,35,0.04)',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {kind && (
      <Mono size={13} color={C.accent} style={{minWidth: 84}}>
        {kind}
      </Mono>
    )}
    <span style={{fontFamily: F.display, fontSize: compact ? 22 : 24, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em'}}>
      {title}
    </span>
    {meta && (
      <span style={{fontFamily: F.display, fontSize: compact ? 20 : 22, fontWeight: 400, color: C.slate}}>{meta}</span>
    )}
  </div>
);
