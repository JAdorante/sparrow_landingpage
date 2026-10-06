import React from 'react';
import {C, F, SHADOW} from '../theme';
import {Avatar, Dot, Mono} from './primitives';
import {Participant} from '../data/demoMeeting';

/** Quiet audio level bars for the active speaker (deterministic from t). */
const Bars: React.FC<{t: number; on: number}> = ({t, on}) => (
  <div style={{display: 'flex', gap: 3, alignItems: 'flex-end', height: 16, opacity: on}}>
    {[0, 1, 2, 3].map((i) => {
      const h = 5 + 9 * (0.5 + 0.5 * Math.sin(t * (7 + i * 1.7) + i * 1.3)) * on;
      return <span key={i} style={{width: 3, height: h, borderRadius: 2, background: C.accent}} />;
    })}
  </div>
);

export const MeetingWindow: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  title: string;
  participants: Participant[];
  speaking?: string | null;
  speakingOn?: number;
  listening?: number;
  opacity?: number;
  scale?: number;
  blur?: number;
  compact?: boolean;
}> = ({x, y, w, h, t, title, participants, speaking, speakingOn = 1, listening = 0, opacity = 1, scale = 1, blur = 0, compact = false}) => {
  if (opacity <= 0) return null;
  const bar = compact ? 48 : 68;
  const pad = compact ? 14 : 22;
  const gap = compact ? 10 : 16;
  const tileW = (w - pad * 2 - gap * (participants.length - 1)) / participants.length;
  const tileH = h - bar - pad;
  const pulse = 0.55 + 0.45 * Math.sin(t * 3.2);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: '50% 50%',
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        borderRadius: compact ? 12 : 18,
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: SHADOW,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: bar,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${pad + 4}px`,
        }}
      >
        <div style={{display: 'flex', gap: 8}}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{width: 9, height: 9, borderRadius: 9, background: C.rule}} />
          ))}
        </div>
        <Mono size={compact ? 11 : 14} color={C.slate}>
          {title}
        </Mono>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: compact ? '5px 10px' : '8px 14px',
            borderRadius: 999,
            border: `1px solid rgba(76,80,217,${0.25 * listening})`,
            background: `rgba(76,80,217,${0.06 * listening})`,
            opacity: listening,
          }}
        >
          <Dot size={compact ? 6 : 8} glow={pulse * listening} />
          <Mono size={compact ? 10 : 13} color={C.accent}>
            Sparrow · Listening
          </Mono>
        </div>
      </div>
      <div style={{display: 'flex', gap, padding: `0 ${pad}px`}}>
        {participants.map((p) => {
          const on = p.id === speaking ? speakingOn : 0;
          return (
            <div
              key={p.id}
              style={{
                position: 'relative',
                width: tileW,
                height: tileH,
                borderRadius: compact ? 8 : 12,
                background: '#EEF1F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: on ? `inset 0 0 0 ${compact ? 1.5 : 2}px rgba(76,80,217,${on})` : 'none',
              }}
            >
              <Avatar initials={p.initials} size={compact ? 64 : 116} tint={p.tint} />
              <div
                style={{
                  position: 'absolute',
                  left: compact ? 12 : 18,
                  bottom: compact ? 10 : 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: F.display,
                    fontSize: compact ? 15 : 20,
                    fontWeight: 500,
                    color: C.ink,
                  }}
                >
                  {p.name}
                </span>
                {on > 0 && <Bars t={t} on={on} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
