import React from 'react';
import {C, F} from '../theme';
import {Avatar, Dot, Mono, Panel} from './primitives';

export const CHAT_BOX = {x: 460, y: 110, w: 1000, h: 860, pad: 44, inputH: 78};

/** Panel with header (context slot) and input bar. */
export const ChatFrame: React.FC<{
  opacity?: number;
  rise?: number;
  input: string;
  caret: boolean;
  sendGlow?: number;
  children?: React.ReactNode;
  header?: React.ReactNode;
}> = ({opacity = 1, rise = 0, input, caret, sendGlow = 0, children, header}) => {
  if (opacity <= 0) return null;
  const {w, h, pad, inputH} = CHAT_BOX;
  return (
    <div
      style={{
        position: 'absolute',
        left: CHAT_BOX.x,
        top: CHAT_BOX.y,
        width: w,
        height: h,
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      <Panel x={0} y={0} w={w} h={h} radius={20}>
        <div
          style={{
            position: 'absolute',
            left: pad,
            right: pad,
            top: 30,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Mono size={13} color={C.faint}>
            Ask Sparrow
          </Mono>
        </div>
        {header}
        <div style={{position: 'absolute', left: 0, right: 0, top: 96, bottom: inputH + 44, overflow: 'hidden'}}>
          {children}
        </div>
        <div
          style={{
            position: 'absolute',
            left: pad - 10,
            right: pad - 10,
            bottom: 28,
            height: inputH,
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            background: '#F7F8FC',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px 0 28px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              flex: 1,
              fontFamily: F.display,
              fontSize: 26,
              fontWeight: 500,
              color: input ? C.ink : C.faint,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {input || 'Ask about people, meetings, commitments…'}
            {caret && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: 28,
                  background: C.accent,
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                }}
              />
            )}
          </div>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 50,
              background: input ? C.ink : C.rule,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: sendGlow ? `0 0 0 ${6 * sendGlow}px rgba(76,80,217,0.12)` : 'none',
            }}
          >
            <svg width={18} height={18} viewBox="0 0 18 18">
              <path d="M9 15 V3 M4 8 L9 3 L14 8" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Panel>
    </div>
  );
};

/** Context chip — Sarah's profile, compressed into the conversation. */
export const ContextChip: React.FC<{x: number; y: number; opacity?: number; name: string; org: string; initials: string}> = ({
  x,
  y,
  opacity = 1,
  name,
  org,
  initials,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      opacity,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '6px 18px 6px 6px',
      borderRadius: 999,
      border: `1px solid rgba(76,80,217,0.28)`,
      background: C.accentSoft,
      whiteSpace: 'nowrap',
    }}
  >
    <Avatar initials={initials} size={34} tint="#E3ECF4" />
    <span style={{fontFamily: F.display, fontSize: 21, fontWeight: 600, color: C.ink}}>{name}</span>
    <span style={{fontFamily: F.display, fontSize: 20, fontWeight: 400, color: C.slate}}>{org}</span>
  </div>
);

export const UserBubble: React.FC<{top: number; text: string; p: number}> = ({top, text, p}) =>
  p <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        right: CHAT_BOX.pad,
        top: top + (1 - p) * 12,
        opacity: p,
        padding: '18px 26px',
        borderRadius: '22px 22px 6px 22px',
        background: C.ink,
        color: '#fff',
        fontFamily: F.display,
        fontSize: 26,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );

export const SparrowLabel: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
    <Dot size={8} />
    <Mono size={13} color={C.accent}>
      Sparrow
    </Mono>
  </div>
);

export const SparrowReply: React.FC<{top: number; p: number; children: React.ReactNode}> = ({top, p, children}) =>
  p <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: CHAT_BOX.pad,
        right: CHAT_BOX.pad,
        top: top + (1 - p) * 10,
        opacity: p,
        filter: p < 1 ? `blur(${(1 - p) * 5}px)` : undefined,
      }}
    >
      <SparrowLabel />
      <div style={{marginTop: 18}}>{children}</div>
    </div>
  );

export const replyText: React.CSSProperties = {
  fontFamily: F.display,
  fontSize: 34,
  fontWeight: 500,
  lineHeight: 1.25,
  letterSpacing: '-0.015em',
  color: C.ink,
  whiteSpace: 'nowrap',
};

/** One owed item. `emphasis` 0..1 lifts the open one without celebrating. */
export const OwedRow: React.FC<{text: string; done: boolean; emphasis?: number; p: number}> = ({
  text,
  done,
  emphasis = 0,
  p,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      height: 60,
      padding: '0 20px',
      marginBottom: 10,
      width: 560,
      boxSizing: 'border-box',
      borderRadius: 12,
      border: `1px solid ${emphasis > 0 ? `rgba(76,80,217,${0.45 * emphasis})` : 'transparent'}`,
      background: emphasis > 0 ? `rgba(76,80,217,${0.05 * emphasis})` : 'transparent',
      opacity: p,
      transform: `translateY(${(1 - p) * 8}px)`,
    }}
  >
    {done ? (
      <svg width={26} height={26} viewBox="0 0 26 26">
        <circle cx={13} cy={13} r={12} fill="none" stroke={C.faint} strokeWidth={1.5} />
        <path d="M8 13.5 L11.5 17 L18 10" fill="none" stroke={C.slate} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ) : (
      <svg width={26} height={26} viewBox="0 0 26 26">
        <circle cx={13} cy={13} r={12} fill="none" stroke={emphasis > 0 ? C.accent : C.slate} strokeWidth={1.8} />
      </svg>
    )}
    <span
      style={{
        fontFamily: F.display,
        fontSize: 30,
        fontWeight: done ? 500 : 600,
        color: done ? C.slate : C.ink,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  </div>
);
