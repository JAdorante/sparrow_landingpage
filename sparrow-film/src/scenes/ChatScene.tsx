import React from 'react';
import {C} from '../theme';
import {
  CHAT_BOX,
  ChatFrame,
  ContextChip,
  OwedRow,
  SparrowReply,
  UserBubble,
  replyText,
} from '../components/SparrowChat';
import {SourceChip} from '../components/SourceChip';
import {PersonProfile} from '../components/PersonProfile';
import {Cursor} from '../components/Cursor';
import {CUES, sceneLength} from '../motion/timing';
import {EASE_IN_OUT} from '../motion/easing';
import {lerpPt, mix, tw, typed, typingEnd} from '../motion/transitions';
import {CHAT, SARAH} from '../data/people';
import {OWED} from '../data/commitments';
import {PROFILE_NODE} from './layout';

const CPS = 44;
export const AREA_TOP = 96; // message area offset inside the chat panel
export const MSG = {q1: 30, a1: 130, source: 270, q2: 380, a2: 470, q3: 690};
export const ROW = {top: MSG.a2 + 31, h: 70};

/**
 * Chat state as a pure function of chat-time `tc` (seconds since the chat
 * scene began). The Action scene keeps calling it so the hand-off is exact.
 */
export const chatState = (tc: number) => {
  const q = CUES.chat;
  const a = CUES.action;
  const chatLen = sceneLength('chat');
  const q3At = chatLen + a.q3;
  const e1 = typingEnd(CHAT.q1, q.q1, CPS);
  const e2 = typingEnd(CHAT.q2, q.q2, CPS);
  const e3 = typingEnd(CHAT.q3, q3At, CPS);
  const s1 = e1 + 0.2;
  const s2 = e2 + 0.2;
  const s3 = e3 + 0.2;
  let input = '';
  if (tc >= q.q1 && tc < s1) input = typed(CHAT.q1, tc, q.q1, CPS);
  else if (tc >= q.q2 && tc < s2) input = typed(CHAT.q2, tc, q.q2, CPS);
  else if (tc >= q3At && tc < s3) input = typed(CHAT.q3, tc, q3At, CPS);
  const typing = input.length > 0;
  const caret = typing || Math.floor(tc * 1.8) % 2 === 0;
  return {
    input,
    caret,
    sendGlow: Math.max(tw(tc, s1 - 0.2, 0.2) * (1 - tw(tc, s1, 0.3)), tw(tc, s2 - 0.2, 0.2) * (1 - tw(tc, s2, 0.3)), tw(tc, s3 - 0.2, 0.2) * (1 - tw(tc, s3, 0.3))),
    q1: tw(tc, s1, 0.45),
    a1: tw(tc, q.a1, 0.7),
    source: tw(tc, q.source, 0.5),
    q2: tw(tc, s2, 0.45),
    a2: tw(tc, q.a2, 0.6),
    rows: OWED.map((_, i) => tw(tc, q.a2 + 0.2 + i * 0.18, 0.5)),
    emphasis: tw(tc, q.emphasis, 0.6),
    q3: tw(tc, s3, 0.45),
    scroll: -120 * tw(tc, s2, 0.7, EASE_IN_OUT) - 110 * tw(tc, s3, 0.7, EASE_IN_OUT),
    hover: tw(tc, q.hover, 0.25) * (1 - tw(tc, q.unhover, 0.3)),
  };
};

export type ChatStateT = ReturnType<typeof chatState>;

export const ChatMessages: React.FC<{s: ChatStateT; fadeOthers?: number; hideOwed?: boolean}> = ({s, fadeOthers = 0, hideOwed = false}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: s.scroll, opacity: 1}}>
    <div style={{opacity: 1 - fadeOthers}}>
      <UserBubble top={MSG.q1} text={CHAT.q1} p={s.q1} />
      <SparrowReply top={MSG.a1} p={s.a1}>
        <div style={replyText}>
          {CHAT.a1[0]}
          <br />
          {CHAT.a1[1]}
        </div>
      </SparrowReply>
      <SourceChip
        x={CHAT_BOX.pad}
        y={MSG.source}
        title={CHAT.source}
        compact
        hover={s.hover}
        opacity={s.source}
        style={{color: C.accent}}
      />
      <UserBubble top={MSG.q2} text={CHAT.q2} p={s.q2} />
      <UserBubble top={MSG.q3} text={CHAT.q3} p={s.q3} />
    </div>
    <SparrowReply top={MSG.a2} p={s.a2}>
      <div style={{opacity: 1 - fadeOthers}}>
        <OwedRow text={OWED[0].text} done p={s.rows[0]} />
      </div>
      <div style={{opacity: hideOwed ? 0 : 1}}>
        <OwedRow text={OWED[1].text} done={false} emphasis={s.emphasis} p={s.rows[1]} />
      </div>
    </SparrowReply>
  </div>
);

/** 06 — ask in plain language; answers come with their sources. */
export const ChatScene: React.FC<{t: number}> = ({t}) => {
  const q = CUES.chat;
  const len = sceneLength('chat');
  if (t >= len) return null;
  const s = chatState(t);
  const panel = tw(t, 0.1, 0.85);
  const fly = tw(t, 0, 1.05, EASE_IN_OUT);
  const chipAt = {x: CHAT_BOX.x + CHAT_BOX.pad, y: CHAT_BOX.y + 26};

  // Cursor: to the source chip, rest on it, leave.
  const chipPt: [number, number] = [CHAT_BOX.x + CHAT_BOX.pad + 250, CHAT_BOX.y + AREA_TOP + MSG.source + 26];
  const cin = tw(t, q.cursor, q.hover - q.cursor, EASE_IN_OUT);
  const cout = tw(t, q.unhover, 0.6, EASE_IN_OUT);
  const cur = lerpPt(lerpPt([1500, 960], chipPt, cin), [1520, 980], cout);
  const cursorO = tw(t, q.cursor, 0.3) * (1 - tw(t, q.unhover + 0.3, 0.3));

  return (
    <>
      {fly < 1 && (
        <div style={{opacity: mix(0.16, 0.7, fly) * (1 - tw(t, 0.55, 0.35))}}>
          <PersonProfile
            x={mix(PROFILE_NODE.x, chipAt.x, fly)}
            y={mix(PROFILE_NODE.y, chipAt.y, fly)}
            w={PROFILE_NODE.w}
            h={PROFILE_NODE.h}
            scale={mix(1, 0.12, fly)}
            name={SARAH.name}
            org={SARAH.org}
            initials={SARAH.initials}
            header={1}
            rows={[]}
          />
        </div>
      )}
      <ChatFrame
        opacity={panel}
        rise={(1 - panel) * 24}
        input={s.input}
        caret={s.caret && panel >= 1}
        sendGlow={s.sendGlow}
        header={
          <ContextChip
            x={CHAT_BOX.pad}
            y={26}
            opacity={tw(t, 0.55, 0.4)}
            name={SARAH.name}
            org={SARAH.org}
            initials={SARAH.initials}
          />
        }
      >
        <ChatMessages s={s} />
      </ChatFrame>
      <Cursor x={cur[0]} y={cur[1]} opacity={cursorO} />
    </>
  );
};
