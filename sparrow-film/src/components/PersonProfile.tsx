import React from 'react';
import {C, F} from '../theme';
import {Avatar, Mono, Panel} from './primitives';

export const PROFILE = {
  pad: 40,
  headerH: 150,
  rowTop: 178,
  rowH: 92,
};

export const profileRowY = (i: number) => PROFILE.rowTop + i * PROFILE.rowH;

export type ProfileRow = {label: string; value: React.ReactNode; p: number};

/** Sarah's context, built one fact at a time. */
export const PersonProfile: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  org: string;
  initials: string;
  header: number;
  rows: ProfileRow[];
  scale?: number;
  opacity?: number;
  children?: React.ReactNode;
}> = ({x, y, w, h, name, org, initials, header, rows, scale = 1, opacity = 1, children}) => {
  if (opacity <= 0) return null;
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
        transformOrigin: 'top left',
      }}
    >
      <Panel x={0} y={0} w={w} h={h} lift={Math.min(1, header * 1.5)}>
        <div
          style={{
            position: 'absolute',
            left: PROFILE.pad,
            top: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            opacity: header,
            transform: `translateY(${(1 - header) * 10}px)`,
          }}
        >
          <Avatar initials={initials} size={72} tint="#E3ECF4" />
          <div>
            <div
              style={{
                fontFamily: F.display,
                fontSize: 40,
                fontWeight: 650,
                letterSpacing: '-0.02em',
                color: C.ink,
                lineHeight: 1,
              }}
            >
              {name}
            </div>
            <div style={{fontFamily: F.display, fontSize: 24, fontWeight: 400, color: C.slate, marginTop: 10}}>
              {org}
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: PROFILE.pad,
            right: PROFILE.pad,
            top: PROFILE.headerH,
            height: 1,
            background: C.rule,
            opacity: header,
          }}
        />
        {rows.map((r, i) =>
          r.p > 0 ? (
            <div
              key={r.label}
              style={{
                position: 'absolute',
                left: PROFILE.pad,
                right: PROFILE.pad,
                top: profileRowY(i),
                opacity: r.p,
                transform: `translateY(${(1 - r.p) * 10}px)`,
                filter: r.p < 1 ? `blur(${(1 - r.p) * 4}px)` : undefined,
              }}
            >
              <Mono size={13} color={C.slate}>
                {r.label}
              </Mono>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 32,
                  fontWeight: 600,
                  color: C.ink,
                  marginTop: 14,
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                {r.value}
              </div>
            </div>
          ) : null,
        )}
        {children}
      </Panel>
    </div>
  );
};
