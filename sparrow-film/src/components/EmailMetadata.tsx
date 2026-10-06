import React from 'react';
import {C, F} from '../theme';
import {Avatar, Mono, Panel} from './primitives';
import {textWidth} from '../measure';

export const EMAIL_BOX = {w: 600, h: 420, pad: 40, valueX: 150, rows: [88, 140, 192], size: 28};

/** Stage positions of the three metadata values, for flights. */
export const emailFieldPos = (x: number, y: number) =>
  EMAIL_BOX.rows.map((top) => ({x: x + EMAIL_BOX.valueX, y: y + top}));

const Lock: React.FC = () => (
  <svg width={22} height={26} viewBox="0 0 22 26">
    <rect x={2} y={11} width={18} height={13} rx={3} fill="none" stroke={C.faint} strokeWidth={1.6} />
    <path d="M6 11 V7.5 a5 5 0 0 1 10 0 V11" fill="none" stroke={C.faint} strokeWidth={1.6} />
  </svg>
);

/**
 * An email as Sparrow sees it: metadata legible, body never legible.
 * `fields` 0..1 controls the metadata values' opacity (they dim once copied out).
 */
export const EmailMetadata: React.FC<{
  x: number;
  y: number;
  from: string;
  to: string;
  time: string;
  opacity?: number;
  fields?: number;
  highlight?: number;
}> = ({x, y, from, to, time, opacity = 1, fields = 1, highlight = 0}) => {
  if (opacity <= 0) return null;
  const rows: [string, string][] = [
    ['FROM', from],
    ['TO', to],
    ['SENT', time],
  ];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: EMAIL_BOX.w, height: EMAIL_BOX.h, opacity}}>
      <Panel x={0} y={0} w={EMAIL_BOX.w} h={EMAIL_BOX.h}>
        <div style={{position: 'absolute', left: EMAIL_BOX.pad, top: 36}}>
          <Mono size={15} color={C.accent}>
            Email
          </Mono>
        </div>
        {rows.map(([label, value], i) => (
          <div key={label} style={{position: 'absolute', left: EMAIL_BOX.pad, top: EMAIL_BOX.rows[i]}}>
            <div style={{position: 'absolute', left: 0, top: 8}}>
              <Mono size={13} color={C.slate}>
                {label}
              </Mono>
            </div>
            <div
              style={{
                position: 'absolute',
                left: EMAIL_BOX.valueX - EMAIL_BOX.pad - 10,
                top: -6,
                width: textWidth(value, EMAIL_BOX.size, 600) + 20,
                height: EMAIL_BOX.size + 12,
                borderRadius: 8,
                background: `rgba(76,80,217,${0.07 * highlight})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: EMAIL_BOX.valueX - EMAIL_BOX.pad,
                top: 0,
                fontFamily: F.display,
                fontSize: EMAIL_BOX.size,
                fontWeight: 600,
                lineHeight: 1,
                color: C.ink,
                opacity: fields,
                whiteSpace: 'nowrap',
              }}
            >
              {value}
            </div>
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: EMAIL_BOX.pad,
            right: EMAIL_BOX.pad,
            top: 250,
            height: 1,
            background: C.rule,
          }}
        />
        <div style={{position: 'absolute', right: EMAIL_BOX.pad, top: 280}}>
          <Lock />
        </div>
        {[0.78, 0.9, 0.84, 0.58].map((wd, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: EMAIL_BOX.pad,
              top: 284 + i * 30,
              width: (EMAIL_BOX.w - EMAIL_BOX.pad * 2 - 50) * wd,
              height: 12,
              borderRadius: 6,
              background: C.bar,
            }}
          />
        ))}
      </Panel>
    </div>
  );
};

export const CAL_BOX = {w: 600, h: 300, pad: 40, pillTop: 150, pillH: 48, pillGap: 12};

/** Stage positions (centers) of each attendee pill, for connections. */
export const calendarPillCenters = (x: number, y: number, people: string[]) => {
  let cx = x + CAL_BOX.pad;
  return people.map((p) => {
    const w = 20 + 30 + 10 + textWidth(p, 20, 500) + 18;
    const c: [number, number] = [cx + w, y + CAL_BOX.pillTop + CAL_BOX.pillH / 2];
    const left = cx;
    cx += w + CAL_BOX.pillGap;
    return {left, w, right: c};
  });
};

export const CalendarEvent: React.FC<{
  x: number;
  y: number;
  title: string;
  people: string[];
  when: string;
  opacity?: number;
  pills?: number;
}> = ({x, y, title, people, when, opacity = 1, pills = 1}) => {
  if (opacity <= 0) return null;
  const pos = calendarPillCenters(0, 0, people);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: CAL_BOX.w, height: CAL_BOX.h, opacity}}>
      <Panel x={0} y={0} w={CAL_BOX.w} h={CAL_BOX.h}>
        <div style={{position: 'absolute', left: CAL_BOX.pad, top: 36}}>
          <Mono size={15} color={C.accent}>
            Calendar
          </Mono>
        </div>
        <div
          style={{
            position: 'absolute',
            left: CAL_BOX.pad,
            top: 78,
            fontFamily: F.display,
            fontSize: 36,
            fontWeight: 650,
            letterSpacing: '-0.02em',
            color: C.ink,
            lineHeight: 1,
          }}
        >
          {title}
        </div>
        {people.map((p, i) => (
          <div
            key={p}
            style={{
              position: 'absolute',
              left: pos[i].left,
              top: CAL_BOX.pillTop,
              width: pos[i].w,
              height: CAL_BOX.pillH,
              borderRadius: 999,
              border: `1px solid ${C.border}`,
              background: '#F6F7FB',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingLeft: 9,
              boxSizing: 'border-box',
              opacity: pills,
            }}
          >
            <Avatar initials={p.split(' ').map((s) => s[0]).join('')} size={30} tint={i === 0 ? '#E3ECF4' : i === 1 ? '#ECE9F2' : '#E4E6FB'} />
            <span style={{fontFamily: F.display, fontSize: 20, fontWeight: 500, color: C.ink, whiteSpace: 'nowrap'}}>{p}</span>
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: CAL_BOX.pad,
            top: 238,
            fontFamily: F.display,
            fontSize: 24,
            fontWeight: 400,
            color: C.slate,
            lineHeight: 1,
          }}
        >
          {when}
        </div>
      </Panel>
    </div>
  );
};
