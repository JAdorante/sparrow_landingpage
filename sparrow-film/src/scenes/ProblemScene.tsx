import React from 'react';
import {C} from '../theme';
import {serifStyle} from '../components/primitives';
import {TitleCard} from '../components/TitleCard';
import {CUES} from '../motion/timing';
import {tw} from '../motion/transitions';
import {COPY} from '../data/copy';

/** [x, y, size, opacity] — primary lines first, quieter background chatter after. */
const SPOTS: [number, number, number, number][] = [
  [250, 330, 40, 0.9],
  [1100, 230, 40, 0.9],
  [430, 660, 40, 0.9],
  [1040, 560, 40, 0.9],
  [170, 140, 30, 0.6],
  [1340, 410, 32, 0.65],
  [640, 860, 30, 0.55],
  [760, 450, 28, 0.5],
  [1440, 120, 28, 0.5],
  [1360, 780, 32, 0.6],
  [200, 900, 28, 0.5],
];

/** 00 — fragments of an ordinary day arrive and leave. Then the problem. */
export const ProblemScene: React.FC<{t: number}> = ({t}) => {
  const q = CUES.problem;
  const up = tw(t, q.exit, 0.95);
  return (
    <>
      {COPY.problem.fragments.map((text, i) => {
        const f = q.fragments[i];
        const pin = tw(t, f.in, 0.65);
        const pout = tw(t, f.out, 0.7);
        const o = pin * (1 - pout);
        if (o <= 0) return null;
        const [x, y, size, alpha] = SPOTS[i];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              ...serifStyle(size, true),
              color: C.slate,
              whiteSpace: 'nowrap',
              opacity: o * alpha,
              transform: `translateY(${(1 - pin) * 8 - pout * 6}px)`,
              filter: pout > 0 ? `blur(${pout * 5}px)` : undefined,
            }}
          >
            {text}
          </div>
        );
      })}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-up * 56}px)`, opacity: 1 - up}}>
        <TitleCard x={160} y={372} text={COPY.problem.line1} size={132} t={t} at={q.headline1} />
        <TitleCard x={160} y={512} text={COPY.problem.line2} size={132} t={t} at={q.headline2} />
      </div>
    </>
  );
};
