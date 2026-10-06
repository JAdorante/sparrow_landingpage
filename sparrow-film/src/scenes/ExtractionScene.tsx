import React from 'react';
import {C} from '../theme';
import {serifStyle} from '../components/primitives';
import {CommitmentCard, CARD, MemoryCard, commitmentTargets} from '../components/MemoryCard';
import {Token} from '../components/Transcript';
import {TitleCard} from '../components/TitleCard';
import {CUES, sceneLength} from '../motion/timing';
import {EASE_IN_OUT} from '../motion/easing';
import {mix, tw} from '../motion/transitions';
import {COMMITMENT, DECISION, OPEN_QUESTION} from '../data/commitments';
import {COPY} from '../data/copy';
import {CLUSTER, COMMIT_ROW, DECISION_POS, QUESTION_POS} from './layout';

const inkToAccent = (p: number) =>
  `rgb(${Math.round(mix(0x17, 0x4c, p))},${Math.round(mix(0x1a, 0x50, p))},${Math.round(mix(0x23, 0xd9, p))})`;

/** 02 — the extracted words resolve into structured memory. */
export const ExtractionScene: React.FC<{t: number}> = ({t}) => {
  const q = CUES.extraction;
  const len = sceneLength('extraction');
  const out = tw(t, len, 0.85);
  const move = tw(t, q.settle, 1.15, EASE_IN_OUT);
  const landed = move >= 1;
  const targets = commitmentTargets(COMMIT_ROW.x, COMMIT_ROW.y, 1);
  const texts: Record<string, string> = {person: COMMITMENT.to, object: COMMITMENT.object, due: COMMITMENT.due};
  const others = [
    {pos: DECISION_POS, m: DECISION, qAt: q.quotes[0], rAt: q.resolve[0]},
    {pos: QUESTION_POS, m: OPEN_QUESTION, qAt: q.quotes[1], rAt: q.resolve[1]},
  ];
  return (
    <>
      {t < len && (
        <CommitmentCard
          x={COMMIT_ROW.x}
          y={COMMIT_ROW.y}
          lift={tw(t, q.frame + 0.35, 0.6)}
          signal={tw(t, q.frame, 0.9)}
          signalOpacity={1 - tw(t, q.frame + 1.3, 0.8)}
          label={tw(t, q.label, 0.5)}
          context={tw(t, q.context, 0.6)}
          tokens={landed ? 1 : 0}
        />
      )}
      {t < len &&
        !landed &&
        (['person', 'object', 'due'] as const).map((k) => {
          const a = CLUSTER[k];
          const b = targets[k];
          // A slight arc so each word travels, rather than slides.
          const lift = Math.sin(move * Math.PI) * (k === 'object' ? 26 : -18);
          return (
            <Token
              key={k}
              text={texts[k]}
              x={mix(a.x, b.x, move)}
              y={mix(a.y, b.y, move) + lift}
              size={mix(a.size, b.size, move)}
              baseSize={a.size}
              color={inkToAccent(1 - move)}
            />
          );
        })}
      {others.map(({pos, m, qAt, rAt}) => {
        const qin = tw(t, qAt, 0.5);
        const r = tw(t, rAt, 0.75);
        return (
          <React.Fragment key={m.label}>
            {qin > 0 && r < 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: pos.x + 8,
                  top: pos.y + 86,
                  width: pos.w - 16,
                  ...serifStyle(28, true),
                  whiteSpace: 'normal',
                  opacity: qin * (1 - r) * 0.85,
                  filter: r > 0 ? `blur(${r * 6}px)` : undefined,
                }}
              >
                {m.quote}
              </div>
            )}
            <MemoryCard
              x={pos.x}
              y={pos.y}
              w={pos.w}
              h={CARD.h}
              label={m.label}
              title={m.title}
              source={m.source}
              opacity={r * (1 - out)}
              titleOpacity={tw(t, rAt + 0.2, 0.6)}
              signal={tw(t, rAt, 0.8)}
              signalOpacity={1 - tw(t, rAt + 1.0, 0.8)}
              style={{transform: `translateY(${(1 - r) * 10}px)`}}
            />
          </React.Fragment>
        );
      })}
      <TitleCard x={160} y={186} text={COPY.extraction.headline} size={100} t={t} at={q.headline} out={len} />
    </>
  );
};
