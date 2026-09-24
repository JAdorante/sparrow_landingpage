import React from 'react';
import {C, F} from '../theme';
import {PersonProfile, profileRowY} from '../components/PersonProfile';
import {EmailMetadata, emailFieldPos, EMAIL_BOX, CalendarEvent, calendarPillCenters} from '../components/EmailMetadata';
import {ConnectionLine} from '../components/ConnectionLine';
import {TitleCard} from '../components/TitleCard';
import {textWidth} from '../measure';
import {CUES, sceneLength} from '../motion/timing';
import {EASE_IN_OUT} from '../motion/easing';
import {curvePoint, lerpRect, mix, tw} from '../motion/transitions';
import {CALENDAR, EMAIL, SARAH} from '../data/people';
import {COPY} from '../data/copy';
import {CAL_POS, EMAIL_POS, PROFILE_MAIN, PROFILE_NODE} from './layout';

const VALUE_SIZE = 32;

/** Stage position of a profile row's value text. */
const rowValue = (i: number) => ({x: PROFILE_NODE.x + 40, y: PROFILE_NODE.y + profileRowY(i) + 27});

/** 05 — privacy, shown: who, when and where travel; the body never does. */
export const PrivacyScene: React.FC<{t: number}> = ({t}) => {
  const q = CUES.privacy;
  const len = sceneLength('privacy');
  const out = tw(t, len, 0.85);
  const move = tw(t, 0, 1.15, EASE_IN_OUT);
  const rect = lerpRect(PROFILE_MAIN, PROFILE_NODE, move);
  const oldRows = 1 - tw(t, 0, 0.7);
  const dim = mix(1, 0.16, tw(t, q.dim, 0.75));

  // Flights: FROM, TO and SENT values leave the email and land in Sarah's context.
  const from = emailFieldPos(EMAIL_POS.x, EMAIL_POS.y);
  const r0 = rowValue(0);
  const r1 = rowValue(1);
  const arrowGap = textWidth(`${EMAIL.from} → `, VALUE_SIZE, 600);
  const dests = [
    {x: r0.x, y: r0.y},
    {x: r0.x + arrowGap, y: r0.y},
    {x: r1.x, y: r1.y},
  ];
  const values = [EMAIL.from, EMAIL.to, EMAIL.time];
  const flights = values.map((v, i) => {
    const p = tw(t, q.lift + i * 0.16, 1.35, EASE_IN_OUT);
    const fade = p <= 0 ? 0 : p < 0.14 ? p / 0.14 : p > 0.78 ? (1 - p) / 0.22 : 1;
    return {v, p, fade, a: from[i], b: dests[i]};
  });
  const landEmail = tw(t, q.land, 0.7);
  const landSent = tw(t, q.land + 0.2, 0.7);

  const pills = calendarPillCenters(CAL_POS.x, CAL_POS.y, CALENDAR.people);
  const nodeLeft: [number, number] = [PROFILE_NODE.x, PROFILE_NODE.y + profileRowY(2) + 30];

  const newRows = [
    {
      label: 'LAST EMAIL',
      value: (
        <span>
          {EMAIL.from} <span style={{color: C.slate, fontWeight: 500}}>→</span> {EMAIL.to}
        </span>
      ),
      p: landEmail,
    },
    {label: 'SENT', value: EMAIL.time, p: landSent},
    {label: 'NEXT MEETING', value: `${CALENDAR.title} · Tue`, p: tw(t, q.connect + 0.55, 0.65)},
  ];

  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: (1 - out) * dim}}>
        <EmailMetadata
          x={EMAIL_POS.x}
          y={EMAIL_POS.y}
          from={EMAIL.from}
          to={EMAIL.to}
          time={EMAIL.time}
          opacity={tw(t, q.email, 0.6)}
          fields={mix(1, 0.3, tw(t, q.lift - 0.08, 0.65))}
          highlight={tw(t, q.lift - 0.4, 0.45) * (1 - tw(t, q.land, 0.7))}
        />
        {flights.map(({v, p, fade, a, b}, i) =>
          fade > 0.02 ? (
            <React.Fragment key={v}>
              <ConnectionLine
                from={[a.x + textWidth(v, EMAIL_BOX.size, 600) + 12, a.y + 14]}
                to={[b.x - 8, b.y + 16]}
                progress={Math.min(1, p * 1.25)}
                opacity={0.45 * fade}
                endDots={false}
              />
              <div
                style={{
                  position: 'absolute',
                  left: curvePoint([a.x, a.y], [b.x, b.y], p, 0.35)[0],
                  top: curvePoint([a.x, a.y], [b.x, b.y], p, 0.35)[1] - Math.sin(p * Math.PI) * (42 + i * 14),
                  fontFamily: F.display,
                  fontSize: mix(EMAIL_BOX.size, VALUE_SIZE, p),
                  fontWeight: 600,
                  lineHeight: 1,
                  color: `rgb(${Math.round(mix(0x4c, 0x17, p))},${Math.round(mix(0x50, 0x1a, p))},${Math.round(mix(0xd9, 0x23, p))})`,
                  whiteSpace: 'nowrap',
                  opacity: fade,
                }}
              >
                {v}
              </div>
            </React.Fragment>
          ) : null,
        )}
        <CalendarEvent
          x={CAL_POS.x}
          y={CAL_POS.y}
          title={CALENDAR.title}
          people={CALENDAR.people}
          when={CALENDAR.when}
          opacity={tw(t, q.calendar, 0.6)}
        />
        {pills.map((pl, i) => (
          <ConnectionLine
            key={i}
            from={[pl.left + pl.w / 2, pl.right[1] - 30]}
            to={nodeLeft}
            progress={tw(t, q.connect + i * 0.1, 0.7)}
            opacity={0.8}
            bend={0.45}
          />
        ))}
      </div>
      {t < len && (
        <div style={{position: 'absolute', inset: 0, opacity: dim}}>
          <PersonProfile
            x={rect.x}
            y={rect.y}
            w={rect.w}
            h={rect.h}
            name={SARAH.name}
            org={SARAH.org}
            initials={SARAH.initials}
            header={1}
            rows={
              oldRows > 0
                ? SARAH.rows.map((r) => ({...r, p: oldRows}))
                : newRows
            }
          />
        </div>
      )}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
        <TitleCard
          x={960}
          y={410}
          align="center"
          text={COPY.privacy.headline}
          size={128}
          t={t}
          at={q.headline}
          serif={COPY.privacy.serif}
          serifAt={q.serif}
          serifSize={54}
        />
      </div>
    </>
  );
};
