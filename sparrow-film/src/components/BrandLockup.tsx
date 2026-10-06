import React from 'react';
import {C} from '../theme';
import {Dot, Mono} from './primitives';

/** ● SPARROW — product lockup. Optional maker line for a company credit. */
export const BrandLockup: React.FC<{product: string; maker?: string; dotGlow?: number; size?: number}> = ({
  product,
  maker,
  dotGlow = 0,
  size = 20,
}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
    <Dot size={size * 0.6} glow={dotGlow} />
    <Mono size={size} color={C.ink} track={0.22} weight={500}>
      {product}
    </Mono>
    {maker ? (
      <>
        <span style={{width: size * 1.8}} />
        <Mono size={size} color={C.slate} track={0.22} weight={400}>
          {maker}
        </Mono>
      </>
    ) : null}
  </div>
);
