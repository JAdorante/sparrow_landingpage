import React from 'react';
import {C, F} from '../theme';
import {displayStyle, Mono} from '../components/primitives';
import {BrandLockup} from '../components/BrandLockup';
import {SparrowFlight} from '../components/SparrowMark';
import {textWidth} from '../measure';
import {CUES} from '../motion/timing';
import {EASE_IN_OUT} from '../motion/easing';
import {mix, Pt, tw} from '../motion/transitions';
import {COPY} from '../data/copy';

const HERO = 138;
const HERO_TRACK = -0.035;
const heroWidth = (s: string) => textWidth(s, HERO, 700) + Math.max(0, s.length - 1) * HERO * HERO_TRACK;

/** Top of the first arch of the "m" in the tagline, where the Sparrow grips. */
export const brandPerch = (): Pt => {
  const line1 = COPY.brand.tagline[0];
  const beforeM = line1.slice(0, line1.lastIndexOf('m'));
  const heroW = heroWidth(line1);
  const beforeW = heroWidth(beforeM);
  const mW = heroW - beforeW;
  return [960 - heroW / 2 + beforeW + mW * 0.37, 342];
};
export const SPARROW_SIZE = 62;

const fadeUp = (p: number, dist = 10): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dist}px)`,
});

/** 09 — phrases clear; then Ravenry builds Sparrow, with the company tagline. */
export const BrandScene: React.FC<{t: number}> = ({t}) => {
  const q = CUES.brand;
  const b = COPY.brand;

  const draw = tw(t, q.line, 0.35);
  const collapse = tw(t, q.line + 0.55, 0.45, EASE_IN_OUT);
  const lineO = 1 - tw(t, q.line + 0.9, 0.25);
  const lineW = 360 * draw * (1 - collapse);

  const phrase = (i: number) => {
    const at = q.lines[i];
    const next = i < q.lines.length - 1 ? q.lines[i + 1] : q.silence;
    const pin = tw(t, at, 0.7);
    const pout = tw(t, next - 0.45, 0.5);
    return {o: pin * (1 - pout), y: (1 - pin) * 12 - pout * 8, blur: (1 - pin) * 4 + pout * 5};
  };

  const company = tw(t, q.lockup, 0.7);
  const relation = tw(t, q.lockup + 0.16, 0.7);
  const product = tw(t, q.lockup + 0.32, 0.7);
  const tag1 = tw(t, q.hero, 0.95);
  const tag2 = tw(t, q.hero + 0.2, 0.95);
  const productLine = tw(t, q.serif, 0.7);
  const cta = tw(t, q.cta, 0.6);
  const footer = tw(t, q.cta + 0.2, 0.6);
  const glow = 0.5 + 0.5 * Math.sin((t - q.lockup) * 2.2);

  const perch = brandPerch();

  return (
    <>
      {lineO > 0 && draw > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 960 - 180 * (1 - collapse),
            top: 539,
            width: Math.max(6, lineW),
            height: mix(1.5, 6, collapse),
            borderRadius: 6,
            background: C.accent,
            opacity: lineO,
          }}
        />
      )}
      {b.lines.map((text, i) => {
        const p = phrase(i);
        if (p.o <= 0) return null;
        return (
          <div
            key={text}
            style={{
              position: 'absolute',
              left: 0,
              width: 1920,
              top: 478,
              textAlign: 'center',
              ...displayStyle(118),
              opacity: p.o,
              transform: `translateY(${p.y}px)`,
              filter: p.blur > 0.05 ? `blur(${p.blur}px)` : undefined,
            }}
          >
            {text}
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1920,
          top: 108,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div style={fadeUp(company)}>
          <Mono size={22} color={C.ink} track={0.3} weight={500}>
            {b.company}
          </Mono>
        </div>
        <div style={fadeUp(relation)}>
          <Mono size={14} color={C.faint} track={0.34} weight={400}>
            {b.relation}
          </Mono>
        </div>
        <div style={fadeUp(product)}>
          <BrandLockup product={b.product} dotGlow={glow * product} size={28} />
        </div>
      </div>

      <div style={{position: 'absolute', left: 0, width: 1920, top: 300, textAlign: 'center'}}>
        {b.tagline.map((line, i) => {
          const p = i === 0 ? tag1 : tag2;
          return (
            <div key={line} style={{overflow: 'hidden', paddingBottom: 18, marginBottom: -18}}>
              <div
                style={{
                  ...displayStyle(138),
                  lineHeight: 0.98,
                  transform: `translateY(${(1 - p) * 130}px)`,
                  opacity: Math.min(1, p * 1.5),
                }}
              >
                {line}
              </div>
            </div>
          );
        })}
      </div>
      <SparrowFlight t={t} startAt={q.sparrow} perch={perch} textIn={tag1} size={SPARROW_SIZE} />

      <div
        style={{
          position: 'absolute',
          left: 400,
          top: 618,
          width: 1120,
          fontFamily: F.display,
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: '-0.012em',
          wordSpacing: '0.18em',
          lineHeight: 1.5,
          color: C.slate,
          textAlign: 'center',
          ...fadeUp(productLine),
        }}
      >
        {b.productLine}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1920,
          top: 768,
          display: 'flex',
          justifyContent: 'center',
          ...fadeUp(cta),
        }}
      >
        <div
          style={{
            padding: '18px 32px',
            borderRadius: 999,
            background: C.accent,
            color: '#fff',
            fontFamily: F.display,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.01em',
            boxShadow: '0 16px 32px -16px rgba(76,80,217,0.6)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          {b.cta.split(' ').map((word, i) => (
            <span key={`${word}-${i}`}>{word}</span>
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1920,
          top: 1004,
          display: 'flex',
          justifyContent: 'center',
          gap: 36,
          ...fadeUp(footer, 6),
        }}
      >
        {b.lines.map((line) => (
          <Mono key={line} size={13} color={C.faint} track={0.2} weight={400}>
            {line}
          </Mono>
        ))}
      </div>
    </>
  );
};
