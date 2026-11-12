// Genera index.html autónomo (three.js incluido) a partir de src/.
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const out = await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', write: false, legalComments: 'none' });
const js = out.outputFiles[0].text.replace(/<\/script/g, '<\\/script');
const html = readFileSync('src/template.html', 'utf8').replace('/*BUNDLE*/', () => js);
writeFileSync('index.html', html);
console.log('index.html', (html.length / 1024).toFixed(0) + ' kB');
