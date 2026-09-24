import '@fontsource/instrument-sans/latin-400.css';
import '@fontsource/instrument-sans/latin-500.css';
import '@fontsource/instrument-sans/latin-600.css';
import '@fontsource/instrument-sans/latin-700.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-400-italic.css';
import '@fontsource/fraunces/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import {clearMeasureCache} from './measure';

const FACES = [
  '400 20px "Instrument Sans"',
  '500 20px "Instrument Sans"',
  '600 20px "Instrument Sans"',
  '700 20px "Instrument Sans"',
  '400 20px "Fraunces"',
  'italic 400 20px "Fraunces"',
  '500 20px "Fraunces"',
  '400 20px "IBM Plex Mono"',
  '500 20px "IBM Plex Mono"',
];

let ready: Promise<void> | null = null;
export const loadFonts = () => {
  if (!ready) {
    ready = Promise.all(FACES.map((f) => document.fonts.load(f)))
      .then(() => document.fonts.ready)
      .then(() => clearMeasureCache());
  }
  return ready;
};
