import React from 'react';
import {C, F} from '../theme';
import {textWidth} from '../measure';
import {Mono, Panel, SignalBorder} from './primitives';
import {Token, TokenTarget} from './Transcript';
import {COMMITMENT} from '../data/commitments';

/** Internal geometry of the commitment card, in card-local px at scale 1. */
export const CARD = {
  w: 640,
  h: 244,
  hLink: 304,
  pad: 40,
  label: 36,
  row1: {top: 82, size: 42},
  row2: {top: 142, size: 30},
  row3: {top: 192, size: 26},
  linkTop: 258,
};

/** Where the three extracted tokens sit inside a commitment card at (x, y, scale). */
export const commitmentTargets = (x: number, y: number, s = 1): Record<string, TokenTarget> => {
  const p = CARD.pad;
  return {
    person: {
      x: x + (p + textWidth(`${COMMITMENT.from} → `, CARD.row1.size, 500)) * s,
      y: y + CARD.row1.top * s,
      size: CARD.row1.size * s,
    },
    object: {
      x: x + (p + textWidth(`${COMMITMENT.verb} `, CARD.row2.size, 500)) * s,
      y: y + CARD.row2.top * s,
      size: CARD.row2.size * s,
    },
    due: {
      x: x + (p + textWidth(`${COMMITMENT.duePrefix} `, CARD.row3.size, 500)) * s,
      y: y + CARD.row3.top * s,
      size: CARD.row3.size * s,
    },
  };
};

export const CommitmentCard: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  scale?: number;
  opacity?: number;
  lift?: number;
  signal?: number;
  signalOpacity?: number;
  label?: number;
  context?: number;
  tokens?: number;
  link?: number;
  linkHover?: number;
  press?: number;
  children?: React.ReactNode;
}> = ({
  x,
  y,
  w = CARD.w,
  h = CARD.h,
  scale = 1,
  opacity = 1,
  lift = 1,
  signal = 0,
  signalOpacity = 1,
  label = 1,
  context = 1,
  tokens = 1,
  link = 0,
  linkHover = 0,
  press = 0,
  children,
}) => {
  if (opacity <= 0) return null;
  const tg = commitmentTargets(0, 0, 1);
  const pre = (text: string, top: number, size: number) => (
    <div
      style={{
        position: 'absolute',
        left: CARD.pad,
        top,
        fontFamily: F.display,
        fontSize: size,
        fontWeight: 500,
        lineHeight: 1,
        color: C.slate,
        opacity: context,
        whiteSpace: 'pre',
      }}
    >
      {text}
    </div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        transform: `scale(${scale * (1 - press * 0.01)})`,
        transformOrigin: 'top left',
      }}
    >
      <Panel x={0} y={0} w={w} h={h} lift={lift} border={lift}>
        <div style={{position: 'absolute', left: CARD.pad, top: CARD.label, opacity: label}}>
          <Mono size={15} color={C.accent}>
            {COMMITMENT.label}
          </Mono>
        </div>
        {pre(`${COMMITMENT.from} → `, CARD.row1.top, CARD.row1.size)}
        {pre(`${COMMITMENT.verb} `, CARD.row2.top, CARD.row2.size)}
        {pre(`${COMMITMENT.duePrefix} `, CARD.row3.top, CARD.row3.size)}
        {tokens > 0 && (
          <>
            <Token text={COMMITMENT.to} x={tg.person.x} y={tg.person.y} size={tg.person.size} baseSize={tg.person.size} opacity={tokens} />
            <Token text={COMMITMENT.object} x={tg.object.x} y={tg.object.y} size={tg.object.size} baseSize={tg.object.size} opacity={tokens} />
            <Token text={COMMITMENT.due} x={tg.due.x} y={tg.due.y} size={tg.due.size} baseSize={tg.due.size} opacity={tokens} />
          </>
        )}
        {link > 0 && (
          <>
            <div
              style={{
                position: 'absolute',
                left: CARD.pad,
                right: CARD.pad,
                top: CARD.linkTop - 22,
                height: 1,
                background: C.rule,
                opacity: link,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: CARD.pad,
                top: CARD.linkTop,
                display: 'flex',
                justifyContent: 'space-between',
                width: CARD.w - CARD.pad * 2,
                opacity: link,
              }}
            >
              <span
                style={{
                  fontFamily: F.display,
                  fontSize: 22,
                  fontWeight: 600,
                  color: C.accent,
                  lineHeight: 1,
                  borderBottom: `1.5px solid rgba(76,80,217,${linkHover})`,
                  paddingBottom: 3,
                }}
              >
                {COMMITMENT.link}
              </span>
              <Mono size={13} color={C.faint}>
                32:14
              </Mono>
            </div>
          </>
        )}
        {children}
      </Panel>
      <SignalBorder x={0} y={0} w={w} h={h} progress={signal} opacity={signalOpacity} />
    </div>
  );
};

/** Generic structured memory: label, title, provenance. */
export const MemoryCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  title: string;
  source?: string;
  opacity?: number;
  titleOpacity?: number;
  signal?: number;
  signalOpacity?: number;
  style?: React.CSSProperties;
}> = ({x, y, w, h = 244, label, title, source, opacity = 1, titleOpacity = 1, signal = 0, signalOpacity = 1, style}) => {
  if (opacity <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity, ...style}}>
      <Panel x={0} y={0} w={w} h={h}>
        <div style={{position: 'absolute', left: 36, top: 36}}>
          <Mono size={15} color={C.accent}>
            {label}
          </Mono>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 36,
            right: 36,
            top: 82,
            fontFamily: F.display,
            fontSize: 32,
            fontWeight: 600,
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            color: C.ink,
            opacity: titleOpacity,
          }}
        >
          {title}
        </div>
        {source && (
          <div style={{position: 'absolute', left: 36, bottom: 32, opacity: titleOpacity}}>
            <Mono size={12} color={C.faint}>
              {source}
            </Mono>
          </div>
        )}
      </Panel>
      <SignalBorder x={0} y={0} w={w} h={h} progress={signal} opacity={signalOpacity} />
    </div>
  );
};
