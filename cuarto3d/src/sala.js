// Modelo de la sala comedor, estimado a partir de las fotos.
// Unidades: metros. Origen: esquina noroeste (junto al árbol de Navidad) a nivel del piso.
// x → este (muro del mapa), z → sur (hacia la puerta de entrada), y → arriba.
// Muro norte: ventanal. Muro oeste: mueble del TV, pasillo, espejo del comedor.
// Los diseños con escritorio reutilizan el escritorio organizado del cuarto (src/room.js).

import { defaultItems as roomItems } from './room.js';

export const ROOM = { W: 3.5, D: 8.0, H: 2.4 };
const { W, D, H } = ROOM;

export const DESIGNS = {
  actual: 'Sala comedor actual',
  ventanal: 'Opción A: escritorio en el ventanal (recomendada)',
  muro: 'Opción B: escritorio en el muro del cuadro (sin corral)',
};
export const CONFIG = {
  designKey: 'sala3d-design',
  defaultDesign: 'actual',
  storeKey: (d) => 'sala3d-v2-' + d,
  file: 'sala',
  camPos: [W + 3.6, 7.4, D + 3.2],
  topH: 14.5,
};

const C = {
  floor: '#8a847e', wall: '#f3f3f1', glass: '#bfe0f5', white: '#f7f7f5', grey: '#b9b7b3',
  sofa: '#c3c1bd', pink: '#b9787d', navy: '#24305a', black: '#1c1c1e', steel: '#b8bcc0',
  wood: '#c9a877', woodLight: '#ddd5c8', woodDark: '#4b4643', blind: '#cfd6da', hall: '#cfe0ec',
};

const box = (size, pos, color, extra = {}) => ({ shape: 'box', size, pos, color, ...extra });
const cyl = (d, h, pos, color, extra = {}) => ({ shape: 'cyl', size: [d, h, d], pos, color, ...extra });
const sph = (d, pos, color, extra = {}) => ({ shape: 'sphere', size: [d, d, d], pos, color, ...extra });
const cone = (d, h, pos, color, extra = {}) => ({ shape: 'cone', size: [d, h, d], pos, color, ...extra });

let n = 0;
const item = (name, pos, parts, extra = {}) => ({
  id: 'o' + (++n), name, pos, rotY: 0, scale: [1, 1, 1], visible: true, parts, ...extra,
});
const PI = Math.PI;

// ---------- piezas reutilizables (todas miran hacia +z; el respaldo queda en -z) ----------
function sofa(L, Dd, color, seats, legColor = C.white) {
  const p = [box([L, 0.2, Dd], [0, 0.24, 0], color)];
  const sw = (L - 0.3) / seats;
  for (let i = 0; i < seats; i++) p.push(box([sw - 0.02, 0.13, Dd - 0.25], [-L / 2 + 0.15 + sw * (i + 0.5), 0.405, 0.1], color));
  p.push(box([L - 0.3, 0.42, 0.2], [0, 0.6, -Dd / 2 + 0.12], color, { rot: [-0.08, 0, 0] }));
  for (const s of [-1, 1]) {
    p.push(box([0.15, 0.32, Dd], [s * (L / 2 - 0.075), 0.47, 0], color));
    for (const z of [-1, 1]) p.push(box([0.05, 0.14, 0.05], [s * (L / 2 - 0.08), 0.07, z * (Dd / 2 - 0.08)], legColor));
  }
  return p;
}

function diningChair() {
  return [
    box([0.44, 0.06, 0.44], [0, 0.46, 0], C.white), box([0.4, 0.05, 0.4], [0, 0.505, 0.01], '#c6c4c1'),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => box([0.05, 0.44, 0.05], [a * 0.19, 0.22, b * 0.19], C.white)),
    box([0.42, 0.62, 0.05], [0, 0.82, -0.205], C.white, { rot: [-0.06, 0, 0] }),
  ];
}

function cushion(x, z, rotY = 0) {
  return [
    box([0.42, 0.4, 0.12], [x, 0.62, z], '#e9edf2', { rot: [0, rotY, 0] }),
    box([0.3, 0.28, 0.125], [x, 0.62, z], '#3e6aa8', { rot: [0, rotY, 0], opacity: 0.85 }),
  ];
}

// ---------- estructura ----------
const T = 0.08;
const sill = 0.82, head = 2.2;      // ventanal
const hallZ0 = 3.65, hallZ1 = 4.6;  // vano del pasillo (muro oeste)
const doorX0 = 2.35, doorX1 = 3.25; // puerta de entrada (muro sur)
const openH = 2.1;

export function defaultItems(design = 'actual') {
  n = 0;
  const items = [];

  items.push(item('Piso', [W / 2, 0, D / 2], [box([W + 0.16, 0.04, D + 0.16], [0, -0.02, 0], C.floor)], { structure: true }));

  items.push(item('Ventanal (muro norte)', [W / 2, 0, 0], [
    box([W, sill, T], [0, sill / 2, -T / 2], C.wall),
    box([W, H - head, T], [0, (H + head) / 2, -T / 2], C.wall),
    box([W, head - sill, 0.01], [0, (sill + head) / 2, -T / 2], C.glass, { opacity: 0.3 }),
    box([0.04, head - sill, 0.05], [0, (sill + head) / 2, -T / 2], '#e8eaec'),
  ], { structure: true, hideFrom: [0, -1] }));

  const zc = (z) => z - D / 2; // coordenada local sobre el muro oeste
  const seg = (z0, z1, y0, y1, color = C.wall) => box([T, y1 - y0, z1 - z0], [-T / 2, (y0 + y1) / 2, zc((z0 + z1) / 2)], color);
  items.push(item('Muro oeste (TV, pasillo, comedor)', [0, 0, D / 2], [
    seg(0, 0.9, 0, sill), seg(0, 0.9, head, H),
    box([0.01, head - sill, 0.9], [-T / 2, (sill + head) / 2, zc(0.45)], C.glass, { opacity: 0.3 }),
    seg(0.9, hallZ0, 0, H), seg(hallZ0, hallZ1, openH, H),
    seg(hallZ1, D, 0, H),
  ], { structure: true, hideFrom: [-1, 0] }));

  items.push(item('Muro este (mapa)', [W, 0, D / 2], [box([T, H, D], [T / 2, H / 2, 0], C.wall)], { structure: true, hideFrom: [1, 0] }));

  const xs = (x) => x - W / 2;
  items.push(item('Muro sur (entrada)', [W / 2, 0, D], [
    box([doorX0, H, T], [xs(doorX0 / 2), H / 2, T / 2], C.wall),
    box([W - doorX1, H, T], [xs((W + doorX1) / 2), H / 2, T / 2], C.wall),
    box([doorX1 - doorX0, H - openH, T], [xs((doorX0 + doorX1) / 2), (H + openH) / 2, T / 2], C.wall),
    box([0.08, 0.2, 0.04], [xs(1.95), 1.45, -0.02], '#ffffff'),
    cyl(0.02, 0.25, [xs(1.95), 1.25, -0.03], '#e6e6e6'),
    box([0.08, 0.12, 0.015], [xs(2.15), 1.1, -0.008], '#e9eef0'),
  ], { structure: true, hideFrom: [0, 1] }));

  items.push(item('Puerta de entrada', [(doorX0 + doorX1) / 2, 0, D - 0.03], [
    box([doorX1 - doorX0, openH - 0.02, 0.045], [0, (openH - 0.02) / 2, 0], C.woodLight),
    box([0.05, 0.22, 0.03], [-(doorX1 - doorX0) / 2 + 0.12, 1.0, -0.035], C.black),
    box([0.14, 0.025, 0.03], [-(doorX1 - doorX0) / 2 + 0.17, 0.95, -0.05], C.black),
  ], { hideFrom: [0, 1] }));

  // Inicio del pasillo hacia las habitaciones
  const hl = 1.8, hz = (hallZ0 + hallZ1) / 2;
  const hall = [
    box([hl, 0.04, hallZ1 - hallZ0], [-hl / 2, -0.02, 0], C.floor),
    box([hl, H, T], [-hl / 2, H / 2, -(hallZ1 - hallZ0) / 2 - T / 2], C.hall),
    box([hl, H, T], [-hl / 2, H / 2, (hallZ1 - hallZ0) / 2 + T / 2], C.hall),
    box([0.05, 2.05, 0.85], [-hl + 0.02, 1.025, 0], C.woodDark),
  ];
  for (let i = 0; i < 9; i++) {
    const x = -0.35 - (i % 3) * 0.32 - Math.floor(i / 3) * 0.05, y = 1.25 + Math.floor(i / 3) * 0.28;
    hall.push(box([0.2, 0.25, 0.02], [x, y, (hallZ1 - hallZ0) / 2 - 0.012], '#ffffff'));
    hall.push(box([0.13, 0.17, 0.022], [x, y, (hallZ1 - hallZ0) / 2 - 0.013], '#d9c7b6'));
  }
  items.push(item('Pasillo (inicio, con fotos)', [0, 0, hz], hall, { structure: true, hideFrom: [-1, 0] }));

  // Persianas
  items.push(item('Persianas del ventanal', [W / 2, 0, 0.05], [
    box([W / 2 - 0.02, 0.34, 0.05], [-W / 4, 2.05, 0], C.blind),
    box([W / 2 - 0.02, 0.34, 0.05], [W / 4, 2.05, 0], C.blind),
    box([W, 0.06, 0.07], [0, 2.24, 0], '#e5e8ea'),
  ]));
  items.push(item('Persiana ventana esquinera', [0.05, 0, 0.45], [box([0.05, 0.34, 0.88], [0, 2.05, 0], C.blind)]));

  // ---------- zona de TV ----------
  const tvL = 2.6, tvZ = 0.92 + tvL / 2;
  const tvUnit = [
    box([0.04, 1.95, tvL], [0.02, 1.2, 0], C.white),
    ...[0.9, 1.35, 1.8].map((y) => box([0.042, 0.006, tvL], [0.02, y, 0], '#dcdcdc')),
    box([0.26, 0.05, tvL + 0.1], [0.15, 2.0, 0], C.white),
    box([0.45, 0.3, tvL], [0.245, 0.47, 0], C.white),
    ...[-1, 0, 1].map((k) => box([0.01, 0.24, tvL / 3 - 0.03], [0.472, 0.46, k * tvL / 3], '#ffffff')),
    box([0.42, 0.1, tvL - 0.4], [0.23, 0.69, 0.2], '#f2f2f2'),
    box([0.48, 0.05, tvL - 0.6], [0.26, 0.765, 0.3], C.white),
    box([0.42, 0.05, 1.0], [0.25, 0.71, -tvL / 2 + 0.5], C.white),
  ];
  items.push(item('Mueble del TV (panel, repisa y cajones)', [0, 0, tvZ], tvUnit));
  items.push(item('Televisor', [0.14, 0, tvZ + 0.1], [
    box([0.06, 0.86, 1.46], [0, 1.4, 0], '#8e9196'),
    box([0.01, 0.82, 1.42], [0.032, 1.4, 0], '#22252b'),
    box([0.1, 0.15, 0.15], [-0.07, 1.4, 0], C.black),
  ]));
  const deco = [];
  for (let i = 0; i < 22; i++) {
    const z = -tvL / 2 + 0.1 + i * (tvL - 0.2) / 21;
    deco.push(sph(0.05, [0.06 + (i % 2) * 0.05, 0.05, z], ['#e2574c', '#4c79c9', '#f2c94c', '#6cc24a', '#9b6fd0', '#f08a3c'][i % 6]));
  }
  [[-1.05, 0.2, 0.16, C.white], [-0.6, 0.26, 0.26, '#2b2b2b'], [-0.3, 0.18, 0.16, C.steel], [0.45, 0.22, 0.18, C.steel], [0.65, 0.18, 0.15, C.steel], [0.9, 0.2, 0.16, C.white]]
    .forEach(([z, h, w, c]) => deco.push(box([0.02, h, w], [0.03, h / 2 + 0.02, z], c), box([0.022, h * 0.7, w * 0.7], [0.033, h / 2 + 0.02, z], '#d9cdbd')));
  deco.push(sph(0.12, [0.1, 0.18, -0.45], '#1d1d1f'));
  items.push(item('Fotos y figuras (repisa del TV)', [0.05, 2.025, tvZ], deco));
  items.push(item('Objetos del mueble del TV', [0.2, 0.79, tvZ], [
    box([0.16, 0.16, 0.38], [0, 0.08, 0.35], C.black),
    cyl(0.14, 0.05, [0.05, 0.025, -0.1], '#2aa7d8'),
    box([0.05, 0.02, 0.18], [0.12, 0.01, 0.0], C.black),
    box([0.04, 0.02, 0.15], [0.12, 0.01, -0.55], '#e8e2d0'),
    box([0.03, 0.2, 0.16], [0.0, 0.1, -1.05], '#e3c98d'),
    box([0.2, 0.004, 0.28], [0.1, 0.002, -0.8], '#ffffff', { rot: [0, 0.2, 0] }),
  ]));

  // Árbol de Navidad en la esquina de la ventana
  const tree = [
    cyl(0.95, 0.02, [0, 0.01, 0], '#c23b3b'), cyl(0.06, 0.3, [0, 0.15, 0], '#5b3b2a'),
    cone(0.95, 0.75, [0, 0.62, 0], '#2f5a3a'), cone(0.78, 0.65, [0, 1.05, 0], '#33623f'),
    cone(0.58, 0.55, [0, 1.42, 0], '#376943'), cone(0.36, 0.42, [0, 1.73, 0], '#3b7047'),
    sph(0.08, [0, 1.98, 0], '#fff6c8'),
  ];
  for (let i = 0; i < 18; i++) {
    const a = i * 2.4, y = 0.4 + (i / 18) * 1.35, r = 0.42 * (1 - (y - 0.3) / 1.75) + 0.04;
    tree.push(sph(0.07, [Math.cos(a) * r, y, Math.sin(a) * r], i % 3 ? '#d23a3a' : '#f2f2f2'));
  }
  items.push(item('Árbol de Navidad', [0.5, 0, 0.5], tree));

  // ---------- zona de estar ----------
  items.push(item('Tapete', [1.95, 0, 2.25], [
    box([1.75, 0.01, 2.5], [0, 0.005, 0], '#d8cbb8'),
    ...[[-0.5, -0.8], [0.45, -0.3], [-0.4, 0.35], [0.5, 0.85], [-0.55, 1.0], [0.1, -1.0]].map(([x, z], i) =>
      box([0.55, 0.012, 0.45], [x, 0.006, z], ['#b4454a', '#c9b79c', '#a85c5f', '#8fa3b3', '#c46a63', '#bfb3a0'][i])),
  ]));
  items.push(item('Sofá gris (bajo el mapa)', [W - 0.44, 0, 2.15], [
    ...sofa(2.0, 0.85, C.sofa, 3),
    ...cushion(-0.6, -0.2, 0.2), ...cushion(0.05, -0.22, -0.1), ...cushion(0.62, -0.2, 0.15),
    sph(0.16, [0.3, 0.6, -0.05], '#d9534f'), sph(0.12, [0.3, 0.8, -0.05], '#f0c9a8'),
  ], { rotY: -PI / 2 }));
  items.push(item('Sillón gris (ventana)', [1.4, 0, 0.5], sofa(0.95, 0.82, C.sofa, 1)));
  items.push(item('Silla Acapulco', [2.5, 0, 0.55], [
    cyl(0.82, 0.03, [0, 0.62, 0], '#e8dcae', { rot: [-1.15, 0, 0] }),
    cyl(0.62, 0.035, [0, 0.62, 0.003], '#2fb3bf', { rot: [-1.15, 0, 0] }),
    cyl(0.4, 0.04, [0, 0.62, 0.006], '#e8dcae', { rot: [-1.15, 0, 0] }),
    ...[-0.25, 0.25].flatMap((x) => [
      box([0.025, 0.5, 0.025], [x, 0.3, 0.15], C.black, { rot: [0.3, 0, 0] }),
      box([0.025, 0.5, 0.025], [x, 0.3, -0.15], C.black, { rot: [-0.3, 0, 0] }),
      box([0.03, 0.04, 0.75], [x, 0.03, 0], '#9a6a3f'),
    ]),
  ], { rotY: -0.3 }));
  items.push(item('Carrito montable', [3.05, 0, 0.45], [
    box([0.3, 0.2, 0.5], [0, 0.2, 0], '#2f63c9'), box([0.28, 0.06, 0.3], [0, 0.33, -0.05], '#a9d63a'),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => cyl(0.14, 0.05, [a * 0.17, 0.07, b * 0.17], C.black, { rot: [0, 0, PI / 2] })),
    box([0.03, 0.9, 0.03], [0, 0.6, -0.3], '#7ac943', { rot: [0.25, 0, 0] }),
  ], { rotY: -0.4 }));
  items.push(item('Mesa de centro', [1.95, 0, 2.2], [
    box([0.58, 0.06, 1.05], [0, 0.38, 0], C.white),
    box([0.55, 0.03, 1.0], [0, 0.12, 0], C.white),
    box([0.58, 0.35, 0.06], [0, 0.18, -0.5], C.white), box([0.58, 0.35, 0.06], [0, 0.18, 0.5], C.white),
    cyl(0.16, 0.16, [0.1, 0.49, -0.3], '#2e7d4f'), sph(0.22, [0.1, 0.66, -0.3], '#6d8b5a', { opacity: 0.8 }),
    cyl(0.15, 0.16, [-0.1, 0.49, 0.05], '#e9efe6'), sph(0.2, [-0.1, 0.66, 0.05], '#c56fb3', { opacity: 0.8 }),
    cyl(0.16, 0.16, [0.12, 0.49, 0.35], '#2e7d4f'), sph(0.22, [0.12, 0.66, 0.35], '#7f6f9a', { opacity: 0.8 }),
    cyl(0.07, 0.12, [-0.15, 0.47, 0.4], '#eef3f6', { opacity: 0.7 }),
    sph(0.13, [0.12, 0.6, 0.0], '#e6e6e6'), cone(0.1, 0.12, [0.12, 0.72, 0.0], '#d9d9d9'),
  ]));
  items.push(item('Sillón rosado', [1.45, 0, 3.55], [
    cyl(0.72, 0.18, [0, 0.33, 0], C.pink), cyl(0.66, 0.08, [0, 0.45, 0.02], '#c4868b'),
    box([0.7, 0.42, 0.14], [0, 0.66, -0.28], C.pink, { rot: [-0.15, 0, 0] }),
    box([0.14, 0.32, 0.5], [-0.33, 0.55, -0.05], C.pink, { rot: [0, -0.35, 0] }),
    box([0.14, 0.32, 0.5], [0.33, 0.55, -0.05], C.pink, { rot: [0, 0.35, 0] }),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => box([0.03, 0.24, 0.03], [a * 0.24, 0.12, b * 0.24], '#2a2a2a')),
  ], { rotY: PI - 0.35 }));
  items.push(item('Hamaca del gato (ventana)', [2.5, 1.55, 0.13], [
    box([0.75, 0.03, 0.04], [0, 0, 0.18], C.wood), box([0.75, 0.03, 0.04], [0, 0.02, -0.02], C.wood),
    box([0.65, 0.02, 0.2], [0, -0.03, 0.08], '#3d3f45'),
    cyl(0.01, 0.45, [-0.25, 0.22, 0.05], '#b0b0b0', { rot: [0.5, 0, 0] }), cyl(0.01, 0.45, [0.25, 0.22, 0.05], '#b0b0b0', { rot: [0.5, 0, 0] }),
  ]));

  // Repisa de cubos con libros, decoración y plantas
  const cube = [
    box([0.33, 1.12, 0.02], [0, 0.56, -0.38], C.white), box([0.33, 1.12, 0.02], [0, 0.56, 0.38], C.white),
    box([0.33, 1.12, 0.02], [0, 0.56, 0], C.white), box([0.02, 1.12, 0.78], [0.155, 0.56, 0], C.white),
    ...[0.02, 0.38, 0.74, 1.11].map((y) => box([0.33, 0.03, 0.78], [0, y, 0], C.white)),
  ];
  const books = ['#c0392b', '#2e86c1', '#f1c40f', '#27ae60', '#8e44ad', '#e67e22', '#16a085'];
  for (let i = 0; i < 12; i++) cube.push(box([0.22, 0.28 - (i % 3) * 0.03, 0.04], [-0.01, 0.17, -0.34 + i * 0.062], books[i % 7]));
  cube.push(sph(0.14, [-0.02, 0.48, -0.2], '#e6c8a8'), box([0.1, 0.22, 0.08], [-0.02, 0.5, 0.18], '#2b2b2b'));
  cube.push(cyl(0.18, 0.08, [0, 1.17, 0.18], '#c9ccd0'), sph(0.32, [0, 1.35, 0.18], '#8d9a7a', { opacity: 0.85 }));
  cube.push(sph(0.14, [0, 1.25, -0.12], '#6b4fa0'), box([0.06, 0.32, 0.12], [0, 1.28, -0.3], '#b98a5a'));
  items.push(item('Repisa de cubos (libros y adornos)', [W - 0.17, 0, 3.7], cube));

  // ---------- muro este: mapa, máscaras, cuadro, perchero ----------
  const map = [];
  const cont = [
    ['Norteamérica', -1.0, 0.25, 0.75, 0.6, '#c9a477'], ['Groenlandia', -0.55, 0.62, 0.35, 0.3, '#b98a55'],
    ['Sudamérica', -0.75, -0.42, 0.32, 0.6, '#d8c3a1'], ['Europa', 0.12, 0.33, 0.35, 0.3, '#a5764a'],
    ['África', 0.18, -0.15, 0.48, 0.6, '#c49a69'], ['Asia', 0.8, 0.35, 1.0, 0.55, '#d4b48a'],
    ['Oceanía', 1.15, -0.45, 0.35, 0.24, '#c9a477'],
  ];
  for (const [, z, y, w, h, c] of cont) map.push(box([0.012, h, w], [0, y, z], c));
  items.push(item('Mapa mundi de madera', [W - 0.01, 1.62, 2.5], map, { hideFrom: [1, 0] }));
  const masks = [];
  [[0.35, 1.95, '#a05a3b'], [0.85, 2.05, '#f2f2f2'], [0.55, 1.68, '#b0613d'], [1.05, 1.82, '#3a3a3a'], [0.9, 1.5, '#e06a8a']]
    .forEach(([z, y, c]) => masks.push(box([0.08, 0.2, 0.13], [-0.04, y, z], c), sph(0.05, [-0.09, y + 0.02, z], '#2c2c2c')));
  items.push(item('Máscaras decorativas', [W, 0, 0], masks, { hideFrom: [1, 0] }));
  items.push(item('Cuadro morado', [W - 0.012, 1.85, 4.85], [
    box([0.02, 0.62, 0.92], [0, 0, 0], '#4a4f9a'),
    box([0.022, 0.18, 0.92], [0, 0.12, 0], '#b28ad6'), box([0.022, 0.12, 0.92], [0, -0.05, 0], '#e39ac2'),
    box([0.022, 0.1, 0.92], [0, -0.2, 0], '#8b86d8'),
  ], { hideFrom: [1, 0] }));
  items.push(item('Perchero con abrigos', [W - 0.02, 0, 7.45], [
    box([0.02, 0.06, 0.5], [0, 1.78, 0], '#ffffff'),
    box([0.12, 0.85, 0.32], [-0.08, 1.35, -0.12], '#1f2a44'),
    box([0.1, 0.7, 0.3], [-0.07, 1.42, 0.15], '#1c1c1e'),
    box([0.08, 0.38, 0.22], [-0.11, 1.55, 0.02], '#d9453f'),
  ], { hideFrom: [1, 0] }));
  items.push(item('Mueble zapatero', [W - 0.19, 0, 7.4], [
    box([0.34, 0.03, 0.62], [0, 0.58, 0], '#8d8680'),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => box([0.012, 0.58, 0.012], [a * 0.16, 0.29, b * 0.3], C.black)),
    box([0.33, 0.012, 0.6], [0, 0.2, 0], C.black),
    box([0.28, 0.1, 0.12], [0, 0.26, -0.15], '#6b6b70'), box([0.28, 0.1, 0.12], [0, 0.06, 0.12], '#7a2b2b'),
    box([0.16, 0.08, 0.12], [0, 0.64, 0.12], '#ffffff'), cyl(0.1, 0.16, [0, 0.68, -0.12], '#6aa86b', { opacity: 0.8 }),
  ]));
  items.push(item('Zapatos en el piso', [2.0, 0, 7.35], [
    box([0.1, 0.1, 0.28], [0, 0.05, 0], '#222'), box([0.1, 0.1, 0.28], [0.12, 0.05, 0.03], '#222'),
  ], { rotY: 0.5 }));
  items.push(item('Silla para comer (bebé)', [1.25, 0, 7.72], [
    box([0.42, 0.06, 0.4], [0, 0.33, 0], '#d7dde2'),
    box([0.04, 0.33, 0.4], [-0.2, 0.165, 0], '#d7dde2'), box([0.04, 0.33, 0.4], [0.2, 0.165, 0], '#d7dde2'),
    box([0.04, 0.12, 0.38], [-0.2, 0.42, 0], '#d7dde2'), box([0.04, 0.12, 0.38], [0.2, 0.42, 0], '#d7dde2'),
    box([0.4, 0.45, 0.1], [0, 0.58, -0.18], '#1e1e20', { rot: [-0.15, 0, 0] }),
    box([0.3, 0.05, 0.3], [0, 0.38, 0.02], '#e9d8c9'),
  ], { rotY: PI }));

  // ---------- comedor ----------
  const tZ = 5.75, tX = 0.8;
  items.push(item('Mesa de comedor (vidrio)', [tX, 0, tZ], [
    box([0.9, 0.012, 1.7], [0, 0.765, 0], '#cfe8e6', { opacity: 0.45 }),
    box([0.8, 0.06, 1.5], [0, 0.72, 0], C.white),
    box([0.75, 0.69, 0.12], [0, 0.345, -0.62], C.white), box([0.75, 0.69, 0.12], [0, 0.345, 0.62], C.white),
    box([0.12, 0.05, 1.3], [0, 0.04, 0], C.white),
  ]));
  items.push(item('Objetos sobre el comedor', [tX, 0.77, tZ], [
    cyl(0.12, 0.2, [0, 0.1, 0.1], '#e8f2f4', { opacity: 0.5 }), sph(0.3, [0, 0.33, 0.1], '#8f7ab5', { opacity: 0.9 }),
    sph(0.1, [0.08, 0.45, 0.0], '#c9343e'),
    cyl(0.08, 0.12, [0.25, 0.06, 0.55], '#7ccf3a'),
    box([0.3, 0.14, 0.35], [-0.15, 0.07, -0.45], '#d8c9b3', { rot: [0, 0.3, 0] }),
    box([0.25, 0.08, 0.22], [0.2, 0.04, -0.15], '#2b2f36'),
  ]));
  items.push(item('Silla comedor 1', [tX + 0.7, 0, tZ - 0.42], diningChair(), { rotY: -PI / 2 }));
  items.push(item('Silla comedor 2', [tX + 0.7, 0, tZ + 0.42], diningChair(), { rotY: -PI / 2 }));
  items.push(item('Silla comedor 3', [tX, 0, tZ - 1.12], diningChair(), { rotY: 0 }));
  items.push(item('Silla comedor 4', [tX, 0, tZ + 1.12], diningChair(), { rotY: PI }));
  items.push(item('Espejo del comedor', [0.015, 1.55, tZ], [
    box([0.03, 1.0, 1.6], [0, 0, 0], C.white),
    box([0.032, 0.82, 1.4], [0.002, 0.02, 0], '#d6e6ee'),
  ], { hideFrom: [-1, 0] }));

  // ---------- zona de Joaquín: corral y gimnasio del gato ----------
  const pw = 1.25, pl = 2.0, ph = 0.68;
  const pen = [box([pw - 0.05, 0.04, pl - 0.05], [0, 0.02, 0], '#efe6cf')];
  [[-0.35, -0.6, '#7cc6d6'], [0.3, -0.2, '#f0a35e'], [-0.2, 0.35, '#7cc6d6'], [0.35, 0.7, '#e9867a']].forEach(([x, z, c]) => pen.push(cyl(0.3, 0.005, [x, 0.043, z], c)));
  for (const s of [-1, 1]) {
    pen.push(box([0.035, 0.035, pl], [s * pw / 2, ph, 0], C.navy), box([0.035, 0.035, pl], [s * pw / 2, 0.04, 0], C.navy));
    pen.push(box([pw, 0.035, 0.035], [0, ph, s * pl / 2], C.navy), box([pw, 0.035, 0.035], [0, 0.04, s * pl / 2], C.navy));
    pen.push(box([0.01, ph - 0.05, pl], [s * pw / 2, ph / 2, 0], '#39477a', { opacity: 0.35 }));
    pen.push(box([pw, ph - 0.05, 0.01], [0, ph / 2, s * pl / 2], '#39477a', { opacity: 0.35 }));
    for (const z of [-pl / 2, 0, pl / 2]) pen.push(box([0.035, ph, 0.035], [s * pw / 2, ph / 2, z], C.navy), box([0.06, 0.06, 0.06], [s * pw / 2, ph, z], '#ffffff'));
  }
  pen.push(box([0.5, 0.45, 0.03], [-0.3, ph + 0.25, pl / 2], C.navy), cyl(0.2, 0.03, [-0.3, ph + 0.2, pl / 2 - 0.05], '#2b2b2b', { rot: [PI / 2, 0, 0] }));
  const toyCols = ['#e2574c', '#4c79c9', '#f2c94c', '#6cc24a', '#f08a3c', '#9b6fd0'];
  for (let i = 0; i < 16; i++) {
    const x = -0.45 + ((i * 0.37) % 0.9), z = -0.8 + ((i * 0.53) % 1.6);
    pen.push(i % 3 ? box([0.09, 0.07, 0.09], [x, 0.08, z], toyCols[i % 6], { rot: [0, i, 0] }) : sph(0.1, [x, 0.09, z], toyCols[i % 6]));
  }
  pen.push(box([0.22, 0.16, 0.32], [0.25, 0.12, 0.45], '#f2b21b'), sph(0.35, [-0.25, 0.12, -0.75], '#c7c9cc'));
  items.push(item('Corral de juego', [2.42, 0, 5.3], pen));
  items.push(item('Arco de fútbol con balones', [3.2, 0, 6.6], [
    box([0.5, 0.4, 0.35], [0, 0.2, 0], '#ffffff', { opacity: 0.35 }),
    sph(0.18, [-0.1, 0.12, 0], '#f2f2f2'), sph(0.15, [0.12, 0.1, 0.05], '#e2574c'), sph(0.14, [0, 0.3, -0.05], '#f2c94c'),
  ]));
  items.push(item('Gimnasio del gato', [3.24, 0, 4.85], [
    box([0.42, 0.06, 0.9], [0, 0.03, 0], '#cfcac4'),
    cyl(0.13, 1.1, [0, 0.6, -0.05], '#d9c9a3'), box([0.36, 0.06, 0.42], [0, 1.15, -0.05], '#c8c5c0'),
    cyl(0.11, 0.55, [0.02, 0.33, -0.33], '#d9c9a3'), box([0.3, 0.06, 0.32], [0.02, 0.62, -0.33], '#c8c5c0'),
    box([0.38, 0.38, 0.32], [0, 0.25, 0.27], '#cfa36b'), cyl(0.12, 0.4, [0, 0.65, 0.27], '#d9c9a3'),
    box([0.34, 0.05, 0.34], [0, 0.88, 0.27], '#c8c5c0'),
  ]));
  items.push(item('Gato', [2.0, 0, 3.0], [
    sph(0.18, [0, 0.12, 0], '#151515'), sph(0.11, [0, 0.26, 0.05], '#151515'),
    cone(0.04, 0.06, [-0.035, 0.33, 0.05], '#151515'), cone(0.04, 0.06, [0.035, 0.33, 0.05], '#151515'),
    box([0.03, 0.03, 0.2], [0, 0.04, -0.15], '#151515', { rot: [0, 0.6, 0] }),
  ], { rotY: 0.4 }));

  return design === 'actual' ? items : withDesk(items, design);
}

// ---------- escritorio traído del cuarto ----------
const DESK_SET = [
  'Escritorio', 'Cajonera 1', 'Cajonera 2', 'Organizador de malla', 'Monitor ultrawide', 'Monitor secundario',
  'Tablet en brazo', 'Teclado', 'Mouse', 'Botella morada', 'Laptop en soporte', 'Impresora', 'Teléfono',
  'Portarretratos alineados', 'Bandeja de documentos', 'Portalápices', 'Caja organizadora de cables', 'Silla negra', 'Silla gris',
];

// Toma el escritorio organizado del cuarto (coordenadas del cuarto: escritorio de x 0 a 2.52 contra la pared z = 0)
// y lo lleva a la sala: punto (x, z) → origen + giro rot.
function deskSet(origin, rot) {
  const src = roomItems('ordenado');
  const c = Math.cos(rot), s = Math.sin(rot);
  return DESK_SET.map((name, i) => {
    const it = src.find((o) => o.name === name);
    if (!it) throw new Error('Falta en el cuarto: ' + name);
    const [x, y, z] = it.pos;
    return {
      ...it, id: 'd' + (i + 1), name: name.startsWith('Silla') ? name + ' (escritorio)' : name,
      pos: [origin[0] + x * c + z * s, y, origin[1] - x * s + z * c].map((v) => Math.round(v * 1000) / 1000),
      rotY: (it.rotY || 0) + rot,
    };
  });
}

function withDesk(items, design) {
  const get = (name) => {
    const it = items.find((o) => o.name === name);
    if (!it) throw new Error('Falta en la sala: ' + name);
    return it;
  };
  const drop = (...names) => names.forEach((nm) => items.splice(items.indexOf(get(nm)), 1));
  const move = (name, x, z, rotY) => { const it = get(name); it.pos = [x, it.pos[1], z]; if (rotY != null) it.rotY = rotY; };
  const shiftZ = (dz, ...names) => names.forEach((nm) => { get(nm).pos[2] += dz; });

  if (design === 'ventanal') {
    // Escritorio bajo el ventanal, entre el árbol y el muro del mapa (mismo frente que en el cuarto).
    drop('Sillón gris (ventana)', 'Silla Acapulco', 'Carrito montable');
    // Sofá, tapete, mesa de centro y sillón rosado bajan 0,5 m para dejar sitio a las sillas de oficina.
    shiftZ(0.5, 'Sofá gris (bajo el mapa)', 'Tapete', 'Mesa de centro', 'Gato');
    shiftZ(0.4, 'Mapa mundi de madera');
    move('Sillón rosado', 1.4, 3.75);
    move('Repisa de cubos (libros y adornos)', W - 0.17, 4.12);
    move('Gimnasio del gato', 3.24, 5.05);
    const desk = deskSet([0.98, 0], 0);
    desk.find((o) => o.name === 'Monitor secundario').pos[0] -= 0.15;
    items.push(...desk);
  } else {
    // Escritorio contra el muro este, bajo el cuadro, mirando hacia el comedor.
    drop('Corral de juego', 'Arco de fútbol con balones', 'Carrito montable');
    move('Gimnasio del gato', 3.0, 0.32, PI / 2);
    move('Silla Acapulco', 2.2, 0.68);
    move('Sillón gris (ventana)', 1.3, 0.5);
    // Comedor 25 cm más cerca del espejo para que quede paso entre las sillas.
    for (const nm of ['Mesa de comedor (vidrio)', 'Objetos sobre el comedor', 'Silla comedor 1', 'Silla comedor 2', 'Silla comedor 3', 'Silla comedor 4']) get(nm).pos[0] -= 0.25;
    items.push(...deskSet([W, 4.25], -PI / 2));
  }
  return items;
}
