// Print the Sparrow's motion channels over time.
// Run: node preview/sparrow-curves.mjs [step] [col,col,...]
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

const outfile = resolve('node_modules/.cache/sparrow-pose.mjs');
await build({
  entryPoints: ['src/components/SparrowMark.tsx'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  external: ['react', 'remotion'],
  logLevel: 'error',
});
const {sparrowPose, FLY_DUR} = await import(pathToFileURL(outfile).href + '?' + Date.now());

const step = Number(process.argv[2] ?? 1 / 60);
const perch = [1400, 342];
const rows = [];
let prev = null;
for (let l = 0; l <= 2.95 + 1e-9; l += step) {
  const p = sparrowPose(l, perch, 62);
  const v = prev ? Math.hypot(p.x - prev.x, p.y - prev.y) / step : 0;
  rows.push({
    t: l.toFixed(3),
    pct: Math.round((l / FLY_DUR) * 100),
    x: p.x.toFixed(1),
    y: p.y.toFixed(1),
    'v px/s': v.toFixed(0),
    pitch: p.pitch.toFixed(1),
    head: p.headRel.toFixed(1),
    'head world': (p.pitch + p.headRel).toFixed(1),
    tail: p.tailRel.toFixed(1),
    fan: p.tailFan.toFixed(2),
    env: p.env.toFixed(1),
    wingE: p.near[0].e.toFixed(0),
    farE: p.far[0].e.toFixed(0),
    spread: p.near[0].spreadS.toFixed(2),
    smear: p.smear.toFixed(2),
    sy: p.sy.toFixed(4),
    grip: `${p.legNear.grip.toFixed(1)}/${p.legFar.grip.toFixed(1)}`,
  });
  prev = p;
}
const pick = process.argv[3]?.split(',');
const keys = pick ? ['t', 'pct', ...pick] : Object.keys(rows[0]);
console.log(keys.map((k) => k.padStart(8)).join(''));
for (const r of rows) console.log(keys.map((k) => String(r[k]).padStart(8)).join(''));
