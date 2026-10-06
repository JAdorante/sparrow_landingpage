import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {loadFonts} from '../fonts';
import {FLY_DUR, SparrowFigure, sparrowPose} from '../components/SparrowMark';
import {BrandScene, brandPerch, SPARROW_SIZE} from '../scenes/BrandScene';
import {CUES} from '../motion/timing';

// Dev-only views for tuning the Sparrow. Not part of the film render.

const useFonts = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Loading fonts'));
  useEffect(() => {
    loadFonts().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready;
};

const Label: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: F.mono, fontSize: 15, color: C.slate}}>{children}</div>
);

/** One magnified bird. Flight frames pin the centre of mass; landing frames show the perch. */
const Cell: React.FC<{local: number; cx: number; cy: number; zoom: number; id: string}> = ({local, cx, cy, zoom, id}) => {
  const landing = local >= FLY_DUR - 0.12;
  const pose = sparrowPose(local, [cx, cy], SPARROW_SIZE * zoom);
  const pinned = landing ? pose : {...pose, x: cx, y: cy};
  return (
    <>
      {landing && (
        <div
          style={{
            position: 'absolute',
            left: cx - 70 * zoom * 0.35,
            top: cy,
            width: 140 * zoom * 0.35,
            height: 60 * zoom * 0.35,
            background: C.ink,
            borderRadius: `${30 * zoom * 0.35}px ${30 * zoom * 0.35}px 0 0`,
          }}
        />
      )}
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <SparrowFigure pose={pinned} id={id} />
      </svg>
    </>
  );
};

export const SparrowSheet: React.FC<{start: number; step: number; cols: number; rows: number; zoom: number}> = ({
  start,
  step,
  cols,
  rows,
  zoom,
}) => {
  const cw = 1920 / cols;
  const ch = 1080 / rows;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const local = start + i * step;
      const landing = local >= FLY_DUR - 0.12;
      const cx = c * cw + cw * 0.5;
      const cy = r * ch + ch * (landing ? 0.72 : 0.55);
      cells.push(
        <React.Fragment key={i}>
          <Cell local={local} cx={cx} cy={cy} zoom={zoom} id={`cell-${i}`} />
          <Label x={c * cw + 14} y={r * ch + 10}>
            {local.toFixed(3)}s · {Math.round((local / FLY_DUR) * 100)}%
          </Label>
        </React.Fragment>,
      );
    }
  }
  return <AbsoluteFill style={{background: C.bg}}>{cells}</AbsoluteFill>;
};

/** Scrubbable: magnified bird on the left, the real scene on the right. */
export const SparrowLab: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ready = useFonts();
  const local = frame / fps - 0.1;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Cell local={local} cx={480} cy={local >= FLY_DUR - 0.12 ? 700 : 560} zoom={5} id="lab" />
      <Label x={24} y={20}>
        {local.toFixed(3)}s · {Math.round((local / FLY_DUR) * 100)}%
      </Label>
      {ready && (
        <div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 1080, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -brandPerch()[0] + 480, top: -342 + 540, width: 1920, height: 1080}}>
            <BrandScene t={CUES.brand.sparrow + local} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/** The real scene magnified around the perch, at scene time `t`. */
export const SparrowCloseup: React.FC<{t: number; zoom: number; follow?: boolean}> = ({t, zoom, follow}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{background: C.bg}} />;
  const time = t + frame / fps;
  const perch = brandPerch();
  const bird = sparrowPose(time - CUES.brand.sparrow, perch, SPARROW_SIZE);
  const [px, py] = follow ? [bird.x, bird.y + 40] : perch;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transformOrigin: '0 0',
          transform: `translate(${960 - px * zoom}px, ${600 - py * zoom}px) scale(${zoom})`,
        }}
      >
        <BrandScene t={time} />
      </div>
      <Label x={24} y={20}>
        scene t {time.toFixed(3)} · bird {(time - CUES.brand.sparrow).toFixed(3)}s
      </Label>
    </AbsoluteFill>
  );
};

/** Grid of the real scene, each cell following the bird at a given local time. */
export const SparrowRealSheet: React.FC<{times: number[]; zoom: number; cols: number}> = ({times, zoom, cols}) => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{background: C.bg}} />;
  const rows = Math.ceil(times.length / cols);
  const cw = 1920 / cols;
  const ch = 1080 / rows;
  const perch = brandPerch();
  return (
    <AbsoluteFill style={{background: C.rule}}>
      {times.map((l, i) => {
        const bird = sparrowPose(l, perch, SPARROW_SIZE);
        const cx = bird.x;
        const cy = bird.y + 10;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (i % cols) * cw + 2,
              top: Math.floor(i / cols) * ch + 2,
              width: cw - 4,
              height: ch - 4,
              overflow: 'hidden',
              background: C.bg,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 1920,
                height: 1080,
                transformOrigin: '0 0',
                transform: `translate(${cw / 2 - cx * zoom}px, ${ch / 2 - cy * zoom}px) scale(${zoom})`,
              }}
            >
              <BrandScene t={CUES.brand.sparrow + l} />
            </div>
            <Label x={10} y={8}>
              {l.toFixed(2)}s · {Math.round((l / FLY_DUR) * 100)}%
            </Label>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** The real scene, perched, with the flight onion-skinned at true scale. */
export const SparrowPath: React.FC<{step: number}> = ({step}) => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{background: C.bg}} />;
  const perch = brandPerch();
  const times: number[] = [];
  for (let l = 0; l < FLY_DUR; l += step) times.push(l);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <BrandScene t={7.95} />
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {times.map((l, i) => (
          <g key={i} opacity={0.4}>
            <SparrowFigure pose={sparrowPose(l, perch, SPARROW_SIZE)} id={`onion-${i}`} />
          </g>
        ))}
        <circle cx={perch[0]} cy={perch[1]} r={2} fill="red" />
      </svg>
    </AbsoluteFill>
  );
};
