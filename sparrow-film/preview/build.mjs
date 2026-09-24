import {build} from 'esbuild';
import {readFileSync, writeFileSync, existsSync} from 'fs';

const res = await build({
  entryPoints: ['preview/preview.tsx'],
  bundle: true,
  minify: true,
  write: false,
  outdir: 'preview/out',
  format: 'iife',
  jsx: 'automatic',
  loader: {'.woff2': 'dataurl', '.woff': 'dataurl'},
  define: {'process.env.NODE_ENV': '"production"'},
  logLevel: 'warning',
});
const js = res.outputFiles.find((f) => f.path.endsWith('.js')).text;
const css = res.outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? '';
const scoreFile = 'public/sparrow-backing-music.wav';
const withAudio = process.argv.includes('--audio') && existsSync(scoreFile);
const score = withAudio ? `data:audio/wav;base64,${readFileSync(scoreFile).toString('base64')}` : '';

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Sparrow — launch film preview</title>
<style>${css}
:root{--bg:#F3F5FA;--ink:#171A23;--slate:#5D6474;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#0F1117;--ink:#E9EAF0;--slate:#9298A3}}
:root[data-theme="dark"]{--bg:#0F1117;--ink:#E9EAF0;--slate:#9298A3}
html,body{margin:0;background:var(--bg);color:var(--ink);height:100%}
body{font-family:"Instrument Sans",system-ui,sans-serif;display:flex;align-items:center;justify-content:center}
.wrap{width:min(100vw - 32px, (100vh - 32px) * 16 / 9);max-width:100%}
</style>
</head>
<body>
<div id="root"></div>
<script>window.__SCORE__=${score ? JSON.stringify(score) : 'null'};</script>
<script>${js.replace(/<\/script/g, '<\\/script')}</script>
</body>
</html>`;
writeFileSync('preview/sparrow-film.html', html);
console.log('wrote preview/sparrow-film.html', (html.length / 1024).toFixed(0) + ' KB', withAudio ? '(with score)' : '');
