import React from 'react';
import {C} from '../theme';

/** Pointer, only shown for intentional interactions. `press` 0..1 squeezes it. */
export const Cursor: React.FC<{x: number; y: number; opacity: number; press?: number}> = ({
  x,
  y,
  opacity,
  press = 0,
}) => {
  if (opacity <= 0) return null;
  const s = 1 - press * 0.12;
  return (
    <svg
      width={30}
      height={38}
      viewBox="0 0 30 38"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: `scale(${s})`,
        transformOrigin: '3px 3px',
        filter: 'drop-shadow(0 3px 6px rgba(23,26,35,0.22))',
      }}
    >
      <path
        d="M3 2.5 L3 30 L10.2 23.4 L14.8 34.2 L19.4 32.3 L14.9 21.6 L24.5 21.3 Z"
        fill={C.ink}
        stroke="#fff"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
};
