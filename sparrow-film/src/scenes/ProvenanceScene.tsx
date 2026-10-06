import React from 'react';
import {C, F} from '../theme';
import {Mono} from '../components/primitives';
import {CommitmentCard, CARD} from '../components/MemoryCard';
import {MeetingWindow} from '../components/MeetingWindow';
import {Cursor} from '../components/Cursor';
import {TitleCard} from '../components/TitleCard';
import {textWidth} from '../measure';
import {CUES, sceneLength} from '../motion/timing';
import {EASE_IN_OUT} from '../motion/easing';
import {clamp01, lerpPt, lerpRect, mix, Rect, tw} from '../motion/transitions';
import {MEETING, PARTICIPANTS} from '../data/demoMeeting';
import {COPY} from '../data/copy';
import {COMMIT_FOCUS, COMMIT_ROW, COMMIT_TUCK} from './layout';

const QUOTE = ['…I’ll', 'send', 'Sarah', 'the', 'revised', 'proposal', 'by', 'Friday.'];
const QUOTE_SIZE = 34;

/** 03 — every memory has a receipt: open the exact moment it came from. */
export const ProvenanceScene: React.FC<{t: number}> = ({t}) => {
  const q = CUES.provenance;
  const len = sceneLength('provenance');

  // Card geometry across the scene: row → focus → expanded → focus → tucked.
  const focus = tw(t, q.focus, 1.0, EASE_IN_OUT);
  const expand = tw(t, q.expand, 0.95, EASE_IN_OUT);
  const collapse = tw(t, q.collapse, 0.85, EASE_IN_OUT);
  const tuck = tw(t, q.tuck, 0.9, EASE_IN_OUT);
  const open = expand * (1 - collapse);

  const link = tw(t, q.link, 0.5) * (1 - tw(t, q.tuck, 0.4));
  const baseH = mix(CARD.h, CARD.hLink, link);
  const focusRect: Rect = {x: mix(COMMIT_ROW.x, COMMIT_FOCUS.x, focus), y: mix(COMMIT_ROW.y, COMMIT_FOCUS.y, focus), w: CARD.w, h: baseH};
  const bigRect: Rect = {x: 460, y: 120, w: 1000, h: 760};
  let r = lerpRect(focusRect, bigRect, open);
  let scale = 1;
  if (tuck > 0) {
    r = {x: mix(COMMIT_FOCUS.x, COMMIT_TUCK.x, tuck), y: mix(COMMIT_FOCUS.y, COMMIT_TUCK.y, tuck), w: CARD.w, h: baseH};
    scale = mix(1, COMMIT_TUCK.scale, tuck);
  }

  // Cursor: enters, clicks "View moment →", leaves once the card opens.
  const linkPt: [number, number] = [COMMIT_FOCUS.x + CARD.pad + 150, COMMIT_FOCUS.y + CARD.linkTop + 14];
  const cIn = tw(t, q.cursorIn, q.click - q.cursorIn - 0.15, EASE_IN_OUT);
  const cOut = tw(t, q.expand + 0.5, 0.7, EASE_IN_OUT);
  const cur = lerpPt(lerpPt([1520, 1010], linkPt, cIn), [1560, 1000], cOut);
  const press = tw(t, q.click, 0.08) * (1 - tw(t, q.click + 0.12, 0.12));
  const cursorO = tw(t, q.cursorIn, 0.3) * (1 - tw(t, q.expand + 0.9, 0.3));
  const hover = tw(t, q.click - 0.35, 0.25) * (1 - tw(t, q.expand, 0.3));

  // The moment itself.
  const content = tw(t, q.expand + 0.45, 0.45) * (1 - tw(t, q.collapse - 0.05, 0.25));
  const play = clamp01((t - q.play) / 1.9);
  const secs = 12 + Math.floor(play * 4);
  const words = QUOTE.map((w, i) => ({w, on: clamp01(play * QUOTE.length * 1.05 - i)}));
  let qx = 0;
  const qPlaced = words.map((wd) => {
    const x = qx;
    qx += textWidth(wd.w + ' ', QUOTE_SIZE, 500);
    return {...wd, x};
  });
  const hlStart = qPlaced[1].x - 8;
  const hlEnd = qPlaced[qPlaced.length - 1].x + textWidth('Friday.', QUOTE_SIZE, 500) + 8;
  const hl = tw(t, q.play + 0.3, 1.6);

  const out = tw(t, len, 0.85);
  return (
    <>
      {t < len && (
        <CommitmentCard
          x={r.x}
          y={r.y}
          w={r.w}
          h={r.h}
          scale={scale}
          link={link}
          linkHover={hover}
          press={press}
        >
          {content > 0 && (
            <div style={{position: 'absolute', left: 0, top: 0, width: 1000, height: 760, opacity: content}}>
              <div style={{position: 'absolute', left: CARD.pad, right: CARD.pad, top: 334, height: 1, background: C.rule}} />
              <div style={{position: 'absolute', left: CARD.pad, top: 362}}>
                <Mono size={14} color={C.accent}>
                  Source · {MEETING.day} · {MEETING.title}
                </Mono>
              </div>
              <MeetingWindow
                x={CARD.pad}
                y={400}
                w={520}
                h={210}
                t={t}
                compact
                title={MEETING.title}
                participants={PARTICIPANTS}
                speaking={MEETING.speaker}
                speakingOn={play > 0 && play < 1 ? 1 : 0.35}
                listening={0}
              />
              <div style={{position: 'absolute', left: 612, top: 404}}>
                <div style={{fontFamily: F.mono, fontSize: 64, fontWeight: 400, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1}}>
                  32:{String(secs).padStart(2, '0')}
                </div>
                <div style={{marginTop: 26, width: 330, height: 4, borderRadius: 4, background: C.bar, position: 'relative'}}>
                  <div style={{position: 'absolute', left: 0, top: 0, height: 4, borderRadius: 4, width: 330 * (0.3 + 0.4 * play), background: C.accent}} />
                  <div
                    style={{
                      position: 'absolute',
                      left: 330 * (0.3 + 0.4 * play) - 7,
                      top: -5,
                      width: 14,
                      height: 14,
                      borderRadius: 14,
                      background: C.accent,
                      boxShadow: '0 0 0 5px rgba(76,80,217,0.12)',
                    }}
                  />
                </div>
                <div style={{marginTop: 22}}>
                  <Mono size={13} color={C.slate}>
                    {PARTICIPANTS[0].name}
                  </Mono>
                </div>
              </div>
              <div style={{position: 'absolute', left: CARD.pad, top: 660, height: 50, width: 920}}>
                <div
                  style={{
                    position: 'absolute',
                    left: hlStart,
                    top: -8,
                    height: QUOTE_SIZE + 16,
                    width: (hlEnd - hlStart) * hl,
                    borderRadius: 8,
                    background: 'rgba(76,80,217,0.09)',
                    borderBottom: `2px solid ${C.accent}`,
                  }}
                />
                {qPlaced.map((wd, i) => (
                  <span
                    key={i}
                    style={{
                      position: 'absolute',
                      left: wd.x,
                      top: 0,
                      fontFamily: F.display,
                      fontSize: QUOTE_SIZE,
                      fontWeight: 500,
                      lineHeight: 1,
                      color: i === 0 ? C.slate : C.ink,
                      opacity: 0.25 + 0.75 * wd.on,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {wd.w}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CommitmentCard>
      )}
      <Cursor x={cur[0]} y={cur[1]} opacity={cursorO} press={press} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
        <TitleCard
          x={160}
          y={560}
          text={COPY.provenance.headline}
          size={112}
          t={t}
          at={q.headline}
          serif={COPY.provenance.serif}
          serifAt={q.serif}
          serifSize={52}
        />
      </div>
    </>
  );
};
