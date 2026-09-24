import React from 'react';
import {C, F} from '../theme';
import {textWidth} from '../measure';
import {clamp01, mix} from '../motion/transitions';

export type Word = {text: string; key?: string; tight?: boolean};
export type Placed = Word & {x: number; y: number; w: number};
export type TokenTarget = {x: number; y: number; size: number};

export const KEY_WEIGHT = 600;
export const BODY_WEIGHT = 500;

/** Lay a sentence out on one line from (x, y); every position is measured. */
export const layoutWords = (words: Word[], x: number, y: number, size: number): Placed[] => {
  const space = textWidth(' ', size, BODY_WEIGHT);
  let cx = x;
  return words.map((wd, i) => {
    if (i > 0 && !wd.tight) cx += space;
    const w = textWidth(wd.text, size, wd.key ? KEY_WEIGHT : BODY_WEIGHT);
    const placed = {...wd, x: cx, y, w};
    cx += w;
    return placed;
  });
};

/** A single word/token drawn at stage position with scale relative to `size`. */
export const Token: React.FC<{
  text: string;
  x: number;
  y: number;
  size: number;
  baseSize: number;
  color?: string;
  opacity?: number;
  weight?: number;
  underline?: number;
}> = ({text, x, y, size, baseSize, color = C.ink, opacity = 1, weight = KEY_WEIGHT, underline = 0}) => {
  const s = size / baseSize;
  const w = textWidth(text, baseSize, weight);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${s})`,
        transformOrigin: 'top left',
        fontFamily: F.display,
        fontSize: baseSize,
        fontWeight: weight,
        lineHeight: 1,
        letterSpacing: 0,
        color,
        opacity,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
      {underline > 0 && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: baseSize * 1.08,
            height: 2,
            width: w * underline,
            background: C.accent,
            borderRadius: 2,
          }}
        />
      )}
    </div>
  );
};

const accentMix = (p: number) => {
  // ink (#171A23) → accent (#4C50D9)
  const a = [0x17, 0x1a, 0x23];
  const b = [0x4c, 0x50, 0xd9];
  return `rgb(${a.map((v, i) => Math.round(mix(v, b[i], p))).join(',')})`;
};

/**
 * The spoken sentence. Words reveal one by one (`reveal` = words shown,
 * fractional for the fade), key tokens highlight to indigo with a signal
 * underline, other words mute, then key tokens detach toward `targets`.
 */
export const Transcript: React.FC<{
  placed: Placed[];
  size: number;
  reveal: number;
  highlight: Record<string, number>;
  mute: number;
  detach?: number;
  targets?: Record<string, TokenTarget>;
  hideKeys?: boolean;
  opacity?: number;
}> = ({placed, size, reveal, highlight, mute, detach = 0, targets = {}, hideKeys = false, opacity = 1}) => (
  <>
    {placed.map((wd, i) => {
      const shown = clamp01(reveal - i);
      if (shown <= 0) return null;
      if (wd.key) {
        if (hideKeys) return null;
        const h = highlight[wd.key] ?? 0;
        const tg = targets[wd.key];
        const d = tg ? detach : 0;
        const x = tg ? mix(wd.x, tg.x, d) : wd.x;
        const y = tg ? mix(wd.y, tg.y, d) : wd.y;
        const s = tg ? mix(size, tg.size, d) : size;
        return (
          <Token
            key={i}
            text={wd.text}
            x={x}
            y={y + (1 - shown) * 8}
            size={s}
            baseSize={size}
            color={accentMix(h)}
            opacity={shown * opacity}
            underline={h * (1 - d)}
          />
        );
      }
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: wd.x,
            top: wd.y + (1 - shown) * 8,
            fontFamily: F.display,
            fontSize: size,
            fontWeight: BODY_WEIGHT,
            lineHeight: 1,
            color: C.ink,
            opacity: shown * mix(1, 0.28, mute) * (1 - detach) * opacity,
            whiteSpace: 'nowrap',
          }}
        >
          {wd.text}
        </div>
      );
    })}
  </>
);
