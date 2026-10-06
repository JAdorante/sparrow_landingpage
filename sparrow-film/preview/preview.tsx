import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, PlayerRef} from '@remotion/player';
import {SparrowFilm} from '../src/SparrowFilm';
import {DURATION_S, FPS} from '../src/motion/timing';

declare global {
  interface Window {
    __SCORE__?: string;
    __player?: PlayerRef | null;
  }
}

const App: React.FC = () => {
  const ref = useRef<PlayerRef>(null);
  useEffect(() => {
    window.__player = ref.current;
  });
  return (
    <main className="wrap">
      <Player
        ref={ref}
        component={SparrowFilm}
        inputProps={{audioSrc: window.__SCORE__ ?? null}}
        durationInFrames={Math.round(DURATION_S * FPS)}
        fps={FPS}
        compositionWidth={1920}
        compositionHeight={1080}
        controls
        clickToPlay
        doubleClickToFullscreen
        allowFullscreen
        style={{width: '100%', aspectRatio: '16 / 9', borderRadius: 14, overflow: 'hidden'}}
        acknowledgeRemotionLicense
      />
    </main>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
