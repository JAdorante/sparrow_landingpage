import React from 'react';
import {CommitmentCard, CARD} from '../components/MemoryCard';
import {PersonProfile, profileRowY} from '../components/PersonProfile';
import {SourceChip} from '../components/SourceChip';
import {ConnectionLine} from '../components/ConnectionLine';
import {TitleCard} from '../components/TitleCard';
import {CUES, sceneLength} from '../motion/timing';
import {tw} from '../motion/transitions';
import {SARAH, SOURCES} from '../data/people';
import {COPY} from '../data/copy';
import {COMMIT_TUCK, PROFILE_MAIN} from './layout';

const CHIP_X = 1340;
const CHIP_Y = [200, 330, 460, 590];

/** 04 — the commitment attaches to a person, and her context assembles. */
export const RelationshipScene: React.FC<{t: number}> = ({t}) => {
  const q = CUES.relationships;
  const len = sceneLength('relationships');
  const out = tw(t, len, 0.85);
  const P = PROFILE_MAIN;
  const cardRight: [number, number] = [COMMIT_TUCK.x + CARD.w * COMMIT_TUCK.scale, COMMIT_TUCK.y + (CARD.h * COMMIT_TUCK.scale) / 2];
  const profLeft: [number, number] = [P.x, P.y + profileRowY(2) + 30];
  return (
    <>
      <div style={{opacity: 1 - out}}>
        <CommitmentCard x={COMMIT_TUCK.x} y={COMMIT_TUCK.y} scale={COMMIT_TUCK.scale} />
        <ConnectionLine from={cardRight} to={profLeft} progress={tw(t, q.attach, 0.8)} />
        {SOURCES.map((s, i) => {
          const p = tw(t, q.sources[i], 0.55);
          const lineP = tw(t, q.sources[i] + 0.1, 0.6);
          return (
            <React.Fragment key={s.title}>
              <ConnectionLine
                from={[P.x + P.w, P.y + 120 + i * 110]}
                to={[CHIP_X, CHIP_Y[i] + 34]}
                progress={lineP}
                opacity={0.8}
              />
              <SourceChip
                x={CHIP_X}
                y={CHIP_Y[i]}
                kind={s.kind}
                title={s.title}
                meta={s.meta}
                opacity={p}
                style={{transform: `translateX(${(1 - p) * 14}px)`}}
              />
            </React.Fragment>
          );
        })}
        <TitleCard x={160} y={870} text={COPY.relationships.headline} size={86} t={t} at={q.headline} />
      </div>
      {t < len && (
        <PersonProfile
          x={P.x}
          y={P.y}
          w={P.w}
          h={P.h}
          name={SARAH.name}
          org={SARAH.org}
          initials={SARAH.initials}
          header={tw(t, q.header, 0.6)}
          rows={SARAH.rows.map((r, i) => ({...r, p: tw(t, q.rows[i], 0.55)}))}
        />
      )}
    </>
  );
};
