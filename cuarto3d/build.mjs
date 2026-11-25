// Genera un HTML autónomo (three.js incluido) por cada espacio modelado en src/.
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SPACES = [
  { model: 'src/room.js', out: 'index.html', title: 'Cuarto 3D editable' },
  { model: 'src/sala.js', out: 'sala.html', title: 'Sala comedor 3D editable' },
];

for (const s of SPACES) {
  const space = {
    name: 'space',
    setup(b) { b.onResolve({ filter: /^\.\/space\.js$/ }, () => ({ path: resolve(s.model) })); },
  };
  const out = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', write: false, legalComments: 'none', plugins: [space] });
  const js = out.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
  const html = readFileSync('src/template.html', 'utf8').replace('<title>Cuarto 3D editable</title>', `<title>${s.title}</title>`).replace('/*BUNDLE*/', () => js);
  writeFileSync(s.out, html);
  console.log(s.out, (html.length / 1024).toFixed(0) + ' kB');
}
