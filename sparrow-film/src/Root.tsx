import React from 'react';
import {Composition, Folder, staticFile} from 'remotion';
import {SparrowFilm} from './SparrowFilm';
import {DURATION_S, FPS} from './motion/timing';
import {SparrowCloseup, SparrowLab, SparrowPath, SparrowRealSheet, SparrowSheet} from './lab/SparrowLab';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SparrowFilm"
      component={SparrowFilm}
      durationInFrames={Math.round(DURATION_S * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{audioSrc: staticFile('sparrow-backing-music.wav')}}
    />
    <Folder name="Lab">
      <Composition id="SparrowLab" component={SparrowLab} durationInFrames={Math.round(3.1 * FPS)} fps={FPS} width={1920} height={1080} />
      <Composition
        id="SparrowSheet"
        component={SparrowSheet}
        durationInFrames={1}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{start: 0.05, step: 0.15, cols: 4, rows: 4, zoom: 2.6}}
      />
      <Composition id="SparrowPath" component={SparrowPath} durationInFrames={1} fps={FPS} width={1920} height={1080} defaultProps={{step: 0.07}} />
      <Composition
        id="SparrowCloseup"
        component={SparrowCloseup}
        durationInFrames={Math.round(3 * FPS)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{t: 5.0, zoom: 6}}
      />
      <Composition
        id="SparrowRealSheet"
        component={SparrowRealSheet}
        durationInFrames={1}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{times: [0.2, 0.5, 0.8, 1.0, 1.2, 1.45, 1.65, 1.8, 1.9, 2.05, 2.3, 2.9], zoom: 2.5, cols: 4}}
      />
    </Folder>
  </>
);
