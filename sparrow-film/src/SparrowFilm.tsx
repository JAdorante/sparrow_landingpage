import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';
import {C} from './theme';
import {loadFonts} from './fonts';
import {PRE_ROLL, POST_ROLL, SceneId, TIMELINE} from './motion/timing';
import {tw} from './motion/transitions';
import {ProblemScene} from './scenes/ProblemScene';
import {MeetingScene} from './scenes/MeetingScene';
import {ExtractionScene} from './scenes/ExtractionScene';
import {ProvenanceScene} from './scenes/ProvenanceScene';
import {RelationshipScene} from './scenes/RelationshipScene';
import {PrivacyScene} from './scenes/PrivacyScene';
import {ChatScene} from './scenes/ChatScene';
import {ActionScene} from './scenes/ActionScene';
import {NetworkScene} from './scenes/NetworkScene';
import {BrandScene} from './scenes/BrandScene';

const SCENES: [SceneId, React.FC<{t: number}>][] = [
  ['problem', ProblemScene],
  ['meeting', MeetingScene],
  ['extraction', ExtractionScene],
  ['provenance', ProvenanceScene],
  ['relationships', RelationshipScene],
  ['privacy', PrivacyScene],
  ['chat', ChatScene],
  ['action', ActionScene],
  ['network', NetworkScene],
  ['brand', BrandScene],
];

/** Very faint indigo light, only where the film wants warmth. */
const Background: React.FC<{t: number}> = ({t}) => {
  const g =
    0.6 * tw(t, 6, 1.5) * (1 - tw(t, 12, 2)) +
    0.5 * tw(t, 20, 1.5) * (1 - tw(t, 26, 2)) +
    0.8 * tw(t, 60, 2);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 75% 70% at 60% 42%, rgba(76,80,217,0.05), rgba(76,80,217,0) 100%)',
          opacity: g,
        }}
      />
    </AbsoluteFill>
  );
};

export type SparrowFilmProps = {audioSrc?: string | null};

export const SparrowFilm: React.FC<SparrowFilmProps> = ({audioSrc}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Loading Sparrow fonts'));
  useEffect(() => {
    loadFonts().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontKerning: 'normal', WebkitFontSmoothing: 'antialiased'}}>
      <Background t={t} />
      {ready &&
        SCENES.map(([id, Scene]) => {
          const [start, end] = TIMELINE[id];
          if (t < start - PRE_ROLL || t >= end + POST_ROLL) return null;
          return (
            <AbsoluteFill key={id}>
              <Scene t={t - start} />
            </AbsoluteFill>
          );
        })}
      {audioSrc ? <Audio src={audioSrc} /> : null}
    </AbsoluteFill>
  );
};
