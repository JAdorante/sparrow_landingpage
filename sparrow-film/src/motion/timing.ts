/**
 * Single source of truth for the film's timing, in SECONDS.
 *
 * TIMELINE sets when each scene owns the frame. CUES are local offsets
 * (seconds since that scene's start). Components never hard-code time:
 * scenes read cues from here and pass progress values down as props.
 */
export const FPS = 60;

export const TIMELINE = {
  problem: [0, 6],
  meeting: [6, 12],
  extraction: [12, 17.5],
  provenance: [17.5, 26.5],
  relationships: [26.5, 33.5],
  privacy: [33.5, 39.5],
  chat: [39.5, 47],
  action: [47, 53],
  network: [53, 58],
  brand: [58, 66],
} as const;

export type SceneId = keyof typeof TIMELINE;
export const DURATION_S = TIMELINE.brand[1];

/** Scenes mount slightly early and stay slightly late so they can hand objects off. */
export const PRE_ROLL = 0;
export const POST_ROLL = 1.3;

export const sceneLength = (id: SceneId) => TIMELINE[id][1] - TIMELINE[id][0];

export const CUES = {
  problem: {
    fragments: [
      {in: 0.25, out: 1.55},
      {in: 1.0, out: 2.35},
      {in: 1.8, out: 3.1},
      {in: 2.55, out: 3.3},
      {in: 0.6, out: 1.9},
      {in: 1.35, out: 2.6},
      {in: 1.6, out: 2.9},
      {in: 2.1, out: 2.9},
      {in: 2.3, out: 3.2},
      {in: 2.75, out: 3.3},
      {in: 2.9, out: 3.35},
    ],
    headline1: 3.7,
    headline2: 4.45,
    exit: 5.6,
  },
  meeting: {
    windowIn: 0.05,
    listening: 0.6,
    wordsStart: 1.0,
    wordStep: 0.1,
    highlight: [2.1, 2.5, 2.9],
    muteOthers: 3.3,
    recede: 3.8,
    detach: 4.3,
  },
  extraction: {
    settle: 0.15,
    frame: 0.8,
    label: 1.05,
    context: 1.25,
    quotes: [1.55, 1.9],
    resolve: [2.2, 2.55],
    headline: 3.4,
  },
  provenance: {
    focus: 0.05,
    link: 1.0,
    cursorIn: 1.3,
    click: 2.3,
    expand: 2.45,
    play: 3.3,
    collapse: 5.3,
    tuck: 5.95,
    headline: 6.15,
    serif: 7.0,
  },
  relationships: {
    header: 0.55,
    attach: 0.75,
    rows: [1.25, 1.8, 2.35, 2.9],
    sources: [3.3, 3.55, 3.8, 4.05],
    headline: 4.55,
  },
  privacy: {
    email: 0.4,
    lift: 1.35,
    land: 2.3,
    calendar: 2.5,
    connect: 3.05,
    dim: 3.9,
    headline: 4.0,
    serif: 4.8,
  },
  chat: {
    q1: 0.85,
    a1: 2.15,
    source: 2.75,
    cursor: 3.1,
    hover: 3.7,
    unhover: 4.45,
    q2: 4.7,
    a2: 5.75,
    emphasis: 6.2,
  },
  action: {
    q3: 0.15,
    morph: 1.2,
    body: 2.3,
    based: 3.8,
    button: 4.15,
    cursor: 4.4,
    hover: 5.0,
  },
  network: {
    shrink: 0.0,
    nodes: 0.85,
    extras: 1.5,
    pulse: 2.15,
    pulseDur: 2.4,
  },
  brand: {
    line: 0.5,
    lines: [1.3, 2.15, 3.0],
    silence: 3.75,
    lockup: 4.25,
    hero: 3.8,
    serif: 5.45,
    sparrow: 5.05,
    cta: 5.85,
  },
} as const;
