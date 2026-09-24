import React from 'react';
import {C, F} from '../theme';
import {Avatar, Mono, Panel} from '../components/primitives';
import {ConnectionLine} from '../components/ConnectionLine';
import {textWidth} from '../measure';
import {CUES, sceneLength} from '../motion/timing';
import {EASE_IN_OUT} from '../motion/easing';
import {clamp01, lerpRect, mix, Pt, tw} from '../motion/transitions';
import {DRAFT_RECT} from './ActionScene';
import {EmailDraft} from '../components/EmailDraft';
import {DRAFT} from '../data/people';

type Node = {id: string; kind: string; title: string; x: number; y: number; person?: string; faint?: boolean};

// The draft lands at `draft`; the pulse path runs meeting → c1 → sarah → c2 → draft.
export const NODES: Node[] = [
  {id: 'meeting', kind: 'Meeting', title: 'Product call', x: 170, y: 470},
  {id: 'c1', kind: 'Commitment', title: 'Send revised proposal', x: 470, y: 300},
  {id: 'sarah', kind: 'Person', title: 'Sarah Chen', x: 830, y: 470, person: 'SC'},
  {id: 'c2', kind: 'Commitment', title: 'Send security overview', x: 1110, y: 300},
  {id: 'draft', kind: 'Draft', title: 'Pilot next steps', x: 1480, y: 470},
  {id: 'marc', kind: 'Person', title: 'Marc Alvarez', x: 560, y: 640, person: 'MA'},
  {id: 'decision', kind: 'Decision', title: 'Enterprise pilot', x: 230, y: 760},
  {id: 'calendar', kind: 'Calendar', title: 'Product review', x: 1010, y: 650},
  {id: 'project', kind: 'Project', title: 'Enterprise pilot', x: 1390, y: 760},
  {id: 'question', kind: 'Open question', title: 'Who owns onboarding?', x: 150, y: 250, faint: true},
  {id: 'email', kind: 'Email', title: 'Sarah → Justin', x: 800, y: 210, faint: true},
  {id: 'planning', kind: 'Meeting', title: 'Pilot planning', x: 1470, y: 220, faint: true},
];

const PATH = ['meeting', 'c1', 'sarah', 'c2', 'draft'];
const EDGES: [string, string][] = [
  ['meeting', 'c1'],
  ['c1', 'sarah'],
  ['sarah', 'c2'],
  ['c2', 'draft'],
  ['meeting', 'decision'],
  ['meeting', 'marc'],
  ['marc', 'sarah'],
  ['sarah', 'calendar'],
  ['calendar', 'project'],
  ['decision', 'project'],
  ['question', 'c1'],
  ['email', 'sarah'],
  ['planning', 'draft'],
];

const NODE_H = 78;
export const nodeW = (n: Node) =>
  Math.max(textWidth(n.title, 24, 600) + (n.person ? 52 : 0), textWidth(n.kind.toUpperCase(), 12, 500, F.mono) + n.kind.length * 12 * 0.14) + 44;

const byId = (id: string) => NODES.find((n) => n.id === id)!;
const right = (n: Node): Pt => [n.x + nodeW(n), n.y + NODE_H / 2];
const left = (n: Node): Pt => [n.x, n.y + NODE_H / 2];
const ends = (a: Node, b: Node): [Pt, Pt] => (a.x <= b.x ? [right(a), left(b)] : [left(a), right(b)]);

export const NetworkNode: React.FC<{n: Node; p: number; lit?: number}> = ({n, p, lit = 0}) => {
  if (p <= 0) return null;
  const w = nodeW(n);
  return (
    <div
      style={{
        position: 'absolute',
        left: n.x,
        top: n.y,
        width: w,
        height: NODE_H,
        opacity: p * (n.faint ? 0.55 : 1),
        transform: `scale(${mix(0.96, 1, p)})`,
      }}
    >
      <Panel x={0} y={0} w={w} h={NODE_H} radius={12} style={{borderColor: lit > 0 ? `rgba(76,80,217,${0.2 + 0.6 * lit})` : undefined}}>
        <div style={{position: 'absolute', left: 22, top: 15}}>
          <Mono size={12} color={lit > 0.3 ? C.accent : C.slate}>
            {n.kind}
          </Mono>
        </div>
        <div style={{position: 'absolute', left: 22, top: 37, display: 'flex', alignItems: 'center', gap: 10}}>
          {n.person && <Avatar initials={n.person} size={28} tint="#E3ECF4" />}
          <span style={{fontFamily: F.display, fontSize: 24, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', lineHeight: 1}}>
            {n.title}
          </span>
        </div>
      </Panel>
    </div>
  );
};

/** Camera for the pull-back; exported so the brand scene can inherit it. */
export const networkCamera = (t: number) => mix(1, 0.93, tw(t, 0.3, 3.2, EASE_IN_OUT));

/** 08 — pull back: the pieces were one connected context all along. */
export const NetworkScene: React.FC<{t: number}> = ({t}) => {
  const q = CUES.network;
  const len = sceneLength('network');
  const out = tw(t, len, 0.9);
  const draft = byId('draft');
  const shrink = tw(t, q.shrink + 0.1, 1.1, EASE_IN_OUT);
  const r = lerpRect(DRAFT_RECT, {x: draft.x, y: draft.y, w: nodeW(draft), h: NODE_H}, shrink);
  const cam = networkCamera(t);

  // Pulse along the path: one segment at a time.
  const seg = PATH.length - 1;
  const pp = clamp01((t - q.pulse) / q.pulseDur) * seg;
  const litOf = (id: string) => {
    const i = PATH.indexOf(id);
    if (i < 0) return 0;
    return clamp01(pp - i + 0.6) * (1 - tw(t, q.pulse + q.pulseDur + 0.2, 0.8));
  };

  const order = (id: string) => NODES.findIndex((n) => n.id === id);
  const nodeP = (n: Node) => (n.id === 'draft' ? 1 : tw(t, (n.faint ? q.extras : q.nodes) + order(n.id) * 0.06, 0.6));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${cam})`,
        transformOrigin: '50% 50%',
        opacity: 1 - out,
      }}
    >
      {EDGES.map(([a, b], i) => {
        const A = byId(a);
        const B = byId(b);
        const [p0, p1] = ends(A, B);
        const onPath = PATH.indexOf(a) >= 0 && PATH.indexOf(b) === PATH.indexOf(a) + 1;
        const segI = onPath ? PATH.indexOf(a) : -1;
        const pulse = segI >= 0 && pp > segI && pp < segI + 1 ? pp - segI : null;
        const faint = A.faint || B.faint;
        return (
          <ConnectionLine
            key={i}
            from={p0}
            to={p1}
            progress={tw(t, (faint ? q.extras : q.nodes) + 0.3 + i * 0.05, 0.7)}
            opacity={faint ? 0.35 : onPath ? 0.9 : 0.55}
            pulse={pulse}
            endDots={false}
          />
        );
      })}
      {NODES.filter((n) => n.id !== 'draft').map((n) => (
        <NetworkNode key={n.id} n={n} p={nodeP(n)} lit={litOf(n.id)} />
      ))}
      {/* the draft, shrinking from full size into its place in the network */}
      {shrink < 1 ? (
        <Panel x={r.x} y={r.y} w={r.w} h={r.h} radius={mix(20, 12, shrink)}>
          <div style={{position: 'absolute', left: 0, top: 0, width: DRAFT_RECT.w, height: DRAFT_RECT.h, opacity: 1 - tw(t, 0.05, 0.55)}}>
            <EmailDraft
              w={DRAFT_RECT.w}
              to={DRAFT.to}
              subject={DRAFT.subject}
              body={DRAFT.body}
              based={DRAFT.based}
              cta={DRAFT.cta}
              fields={1}
              bodyP={DRAFT.body.map(() => 1)}
              basedP={1}
              button={1}
              buttonHover={1}
            />
          </div>
          <div style={{position: 'absolute', left: 22, top: 15, opacity: tw(t, 0.75, 0.4)}}>
            <Mono size={12} color={C.slate}>
              Draft
            </Mono>
            <div style={{marginTop: 10, fontFamily: F.display, fontSize: 24, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', lineHeight: 1}}>
              {draft.title}
            </div>
          </div>
        </Panel>
      ) : (
        <NetworkNode n={draft} p={1} lit={litOf('draft')} />
      )}
    </div>
  );
};
