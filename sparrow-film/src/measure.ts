import {F} from './theme';

// Canvas text measurement so every word position is computed, not guessed.
// Only valid after fonts have loaded (see fonts.ts).
let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();

export const textWidth = (
  text: string,
  size: number,
  weight = 500,
  family: string = F.display,
  italic = false,
) => {
  const key = `${text}|${size}|${weight}|${family}|${italic}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return text.length * size * 0.55;
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
  const w = ctx.measureText(text).width;
  cache.set(key, w);
  return w;
};

export const clearMeasureCache = () => cache.clear();
