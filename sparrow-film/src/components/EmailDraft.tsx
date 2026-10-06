import React from 'react';
import {C, F} from '../theme';
import {Mono} from './primitives';
import {SourceChip} from './SourceChip';

/**
 * Draft content, laid out inside whatever rect the scene gives it.
 * Reveal values are 0..1 per part; the scene decides timing.
 */
export const EmailDraft: React.FC<{
  w: number;
  to: string;
  subject: string;
  body: string[];
  based: string[];
  cta: string;
  fields: number;
  bodyP: number[];
  basedP: number;
  button: number;
  buttonHover: number;
}> = ({w, to, subject, body, based, cta, fields, bodyP, basedP, button, buttonHover}) => {
  const pad = 56;
  const field = (label: string, value: string, top: number) => (
    <div style={{position: 'absolute', left: pad, top, display: 'flex', alignItems: 'baseline', gap: 28, opacity: fields}}>
      <Mono size={13} color={C.slate} style={{width: 92}}>
        {label}
      </Mono>
      <span style={{fontFamily: F.display, fontSize: 28, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap'}}>{value}</span>
    </div>
  );
  return (
    <>
      <div style={{position: 'absolute', left: pad, top: 44, opacity: fields, display: 'flex', gap: 14, alignItems: 'center'}}>
        <Mono size={14} color={C.accent}>
          Draft
        </Mono>
        <Mono size={13} color={C.faint}>
          Not sent
        </Mono>
      </div>
      {field('To', to, 100)}
      {field('Subject', subject, 150)}
      <div style={{position: 'absolute', left: pad, right: pad, top: 208, height: 1, background: C.rule, opacity: fields}} />
      <div style={{position: 'absolute', left: pad, top: 244, width: w - pad * 2}}>
        {body.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: F.display,
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.45,
              color: C.ink,
              minHeight: line ? undefined : 18,
              whiteSpace: 'nowrap',
              opacity: bodyP[i] ?? 0,
              transform: `translateY(${(1 - (bodyP[i] ?? 0)) * 6}px)`,
            }}
          >
            {line}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: pad, top: 560, opacity: basedP}}>
        <Mono size={13} color={C.slate}>
          Based on
        </Mono>
      </div>
      {based.map((b, i) => (
        <SourceChip
          key={b}
          x={pad + i * 340}
          y={596}
          title={b.split(' · ')[0]}
          meta={b.split(' · ')[1]}
          compact
          opacity={basedP}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          right: pad,
          bottom: 48,
          opacity: button,
          transform: `translateY(${(1 - button) * 8}px)`,
          padding: '20px 30px',
          borderRadius: 14,
          background: buttonHover ? `rgb(${76 - 14 * buttonHover},${80 - 14 * buttonHover},${217 - 22 * buttonHover})` : C.accent,
          color: '#fff',
          fontFamily: F.display,
          fontSize: 24,
          fontWeight: 600,
          boxShadow: `0 10px 24px -10px rgba(76,80,217,${0.5 + 0.2 * buttonHover})`,
          whiteSpace: 'nowrap',
        }}
      >
        {cta}
      </div>
    </>
  );
};
