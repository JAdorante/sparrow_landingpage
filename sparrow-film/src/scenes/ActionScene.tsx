import React from 'react';
import {CHAT_BOX, ChatFrame, ContextChip, OwedRow} from '../components/SparrowChat';
import {OWED} from '../data/commitments';
import {EmailDraft} from '../components/EmailDraft';
import {Panel, SignalBorder} from '../components/primitives';
import {Cursor} from '../components/Cursor';
import {CUES, sceneLength} from '../motion/timing';
import {EASE_IN_OUT} from '../motion/easing';
import {lerpPt, lerpRect, Rect, tw} from '../motion/transitions';
import {DRAFT, SARAH} from '../data/people';
import {AREA_TOP, ChatMessages, ROW, chatState} from './ChatScene';

export const DRAFT_RECT: Rect = {x: CHAT_BOX.x, y: CHAT_BOX.y, w: CHAT_BOX.w, h: CHAT_BOX.h};

/** 07 — the open commitment becomes a prepared follow-up. You decide. */
export const ActionScene: React.FC<{t: number}> = ({t}) => {
  const q = CUES.action;
  const len = sceneLength('action');
  if (t >= len) return null;
  const tc = t + sceneLength('chat');
  const s = chatState(tc);

  const morph = tw(t, q.morph, 1.05, EASE_IN_OUT);
  const others = tw(t, q.morph - 0.1, 0.45);
  const rowRect: Rect = {
    x: CHAT_BOX.x + CHAT_BOX.pad,
    y: CHAT_BOX.y + AREA_TOP + ROW.top + ROW.h + s.scroll,
    w: 560,
    h: 60,
  };
  const r = lerpRect(rowRect, DRAFT_RECT, morph);

  const bodyP = DRAFT.body.map((_, i) => tw(t, q.body + i * 0.22, 0.45));
  const btnPt: [number, number] = [DRAFT_RECT.x + DRAFT_RECT.w - 56 - 120, DRAFT_RECT.y + DRAFT_RECT.h - 48 - 34];
  const cin = tw(t, q.cursor, q.hover - q.cursor, EASE_IN_OUT);
  const cur = lerpPt([1560, 1010], btnPt, cin);
  const cursorO = tw(t, q.cursor, 0.3);
  const hover = tw(t, q.hover, 0.3);

  return (
    <>
      <ChatFrame
        opacity={1 - others}
        input={s.input}
        caret={s.caret && morph === 0}
        sendGlow={s.sendGlow}
        header={<ContextChip x={CHAT_BOX.pad} y={26} name={SARAH.name} org={SARAH.org} initials={SARAH.initials} />}
      >
        <ChatMessages s={s} hideOwed={morph > 0} />
      </ChatFrame>
      {morph > 0 && (
        <>
          <Panel x={r.x} y={r.y} w={r.w} h={r.h} radius={12 + 8 * morph}>
            <div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - tw(t, q.morph + 0.15, 0.35)}}>
              <OwedRow text={OWED[1].text} done={false} emphasis={1} p={1} />
            </div>
            <div style={{position: 'absolute', left: 0, top: 0, width: DRAFT_RECT.w, height: DRAFT_RECT.h}}>
              <EmailDraft
                w={DRAFT_RECT.w}
                to={DRAFT.to}
                subject={DRAFT.subject}
                body={DRAFT.body}
                based={DRAFT.based}
                cta={DRAFT.cta}
                fields={tw(t, q.morph + 0.85, 0.5)}
                bodyP={bodyP}
                basedP={tw(t, q.based, 0.5)}
                button={tw(t, q.button, 0.5)}
                buttonHover={hover}
              />
            </div>
          </Panel>
          <SignalBorder x={r.x} y={r.y} w={r.w} h={r.h} radius={12 + 8 * morph} progress={1} opacity={0.6 * (1 - tw(t, q.morph + 0.9, 0.7))} />
        </>
      )}
      <Cursor x={cur[0]} y={cur[1]} opacity={cursorO} />
    </>
  );
};
