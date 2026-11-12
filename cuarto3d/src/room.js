// Modelo del cuarto, estimado a partir de las fotos.
// Unidades: metros. Origen: esquina noroeste (ventana esquinera) a nivel del piso.
// x → este (hacia el clóset), z → sur (hacia la cama), y → arriba.
// Cada objeto es una lista de piezas simples (caja, cilindro, esfera), así que todo es editable.

export const ROOM = { W: 3.0, D: 2.9, H: 2.4 };
const { W, D, H } = ROOM;

const C = {
  floor: '#8f877d', wall: '#f2f2ef', green: '#c4e6c8', glass: '#bfe0f5',
  white: '#f5f5f3', dark: '#3a3431', black: '#1c1c1e', grey: '#8a8d91',
  lightGrey: '#c9cbcc', blue: '#9fd0ea', doorWood: '#6f6660', band: '#cfc9c1',
  blind: '#cdd6d1', bedGreen: '#a9e3a4', spot: '#3fae5a', brown: '#7a5a48',
  purple: '#c9a6e6', steel: '#b8bcc0', shelf: '#5b5552',
};

const box = (size, pos, color, extra = {}) => ({ shape: 'box', size, pos, color, ...extra });
const cyl = (d, h, pos, color, extra = {}) => ({ shape: 'cyl', size: [d, h, d], pos, color, ...extra });
const sph = (d, pos, color, extra = {}) => ({ shape: 'sphere', size: [d, d, d], pos, color, ...extra });

let n = 0;
const item = (name, pos, parts, extra = {}) => ({
  id: 'o' + (++n), name, pos, rotY: 0, scale: [1, 1, 1], visible: true, parts, ...extra,
});

// ---------- piezas reutilizables ----------
function chair(colorBack, colorSeat) {
  const p = [];
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5;
    p.push(box([0.3, 0.035, 0.05], [Math.cos(a) * 0.15, 0.08, -Math.sin(a) * 0.15], C.black, { rot: [0, a, 0] }));
    p.push(cyl(0.055, 0.055, [Math.cos(a) * 0.3, 0.03, -Math.sin(a) * 0.3], C.black));
  }
  p.push(cyl(0.05, 0.34, [0, 0.26, 0], C.steel));
  p.push(box([0.5, 0.08, 0.48], [0, 0.47, 0], colorSeat));
  p.push(box([0.06, 0.3, 0.04], [0, 0.6, 0.25], C.black));
  p.push(box([0.46, 0.55, 0.05], [0, 0.86, 0.27], colorBack, { rot: [0.08, 0, 0] }));
  p.push(box([0.3, 0.14, 0.05], [0, 1.25, 0.3], colorBack));
  for (const s of [-1, 1]) {
    p.push(box([0.03, 0.2, 0.04], [s * 0.28, 0.57, 0.02], C.black));
    p.push(box([0.08, 0.03, 0.26], [s * 0.28, 0.68, 0], C.black));
  }
  return p;
}

function drawerUnit() {
  const p = [box([0.42, 0.68, 0.56], [0, 0.36, 0], C.white)];
  const fronts = [[0.15, 0.615], [0.15, 0.455], [0.34, 0.2]];
  for (const [h, y] of fronts) {
    p.push(box([0.4, h - 0.01, 0.015], [0, y, 0.285], '#ffffff'));
    p.push(box([0.1, 0.012, 0.012], [0, y + h / 2 - 0.035, 0.298], C.steel));
  }
  return p;
}

function plushies(count, span, y, palette, z = 0) {
  const p = [];
  for (let i = 0; i < count; i++) {
    const x = -span / 2 + (span * (i + 0.5)) / count;
    const d = 0.16 + ((i * 37) % 5) * 0.012;
    const col = palette[i % palette.length];
    p.push(sph(d, [x, y + d / 2, z], col));
    p.push(sph(d * 0.62, [x, y + d * 1.15, z], col));
  }
  return p;
}

// ---------- estructura ----------
const T = 0.08; // grosor de muros
const sill = 0.86, head = 2.12; // antepecho y dintel de la ventana
const winW = 1.0; // tramo de ventana sobre el muro oeste (desde la esquina)

export const DESIGNS = { joaquin: 'Habitación de Joaquín (Montessori)', actual: 'Cuarto actual (oficina + cuna)', ordenado: 'Cuarto actual con escritorio organizado' };

export function defaultItems(design = 'actual') {
  const kid = design === 'joaquin';
  const tidy = design === 'ordenado';
  n = 0;
  const items = [];

  items.push(item('Piso', [W / 2, 0, D / 2], [
    box([W + 0.7, 0.04, D], [0.35, -0.02, 0], C.floor),
  ], { structure: true }));

  items.push(item('Muro norte (ventana)', [W / 2, 0, 0], [
    box([W, sill, T], [0, sill / 2, -T / 2], C.wall),
    box([W, H - head, T], [0, (H + head) / 2, -T / 2], C.wall),
    box([W, head - sill, 0.01], [0, (sill + head) / 2, -T / 2], C.glass, { opacity: 0.3 }),
  ], { structure: true, hideFrom: [0, -1] }));

  items.push(item('Muro oeste', [0, 0, D / 2], [
    box([T, sill, winW], [-T / 2, sill / 2, -D / 2 + winW / 2], C.wall),
    box([T, H - head, winW], [-T / 2, (H + head) / 2, -D / 2 + winW / 2], C.wall),
    box([0.01, head - sill, winW], [-T / 2, (sill + head) / 2, -D / 2 + winW / 2], C.glass, { opacity: 0.3 }),
    box([T, H, 0.9], [-T / 2, H / 2, -D / 2 + winW + 0.45], C.wall),
    box([T, H, D - winW - 0.9], [-T / 2, H / 2, D / 2 - (D - winW - 0.9) / 2], C.green),
  ], { structure: true, hideFrom: [-1, 0] }));

  // Muro sur: verde, con el vano de la puerta en el extremo este (a los pies de la cama)
  const doorW = 0.82, doorH = 2.05, doorX0 = W - doorW - 0.05; // el vano va de doorX0 a W - 0.05
  items.push(item('Muro sur (verde, con puerta)', [W / 2, 0, D], [
    box([doorX0, H, T], [-W / 2 + doorX0 / 2, H / 2, T / 2], C.green),
    box([W - doorX0, H - doorH, T], [W / 2 - (W - doorX0) / 2, (H + doorH) / 2, T / 2], C.wall),
    box([0.05, doorH, T], [W / 2 - 0.025, doorH / 2, T / 2], C.wall),
  ], { structure: true, hideFrom: [0, 1] }));

  // Muro este: fondo del clóset, que ocupa toda la pared
  const closetLen = D;
  items.push(item('Muro este (fondo clóset)', [W + 0.62, 0, D / 2], [
    box([T, H, D + T], [T / 2, H / 2, 0], C.wall),
  ], { structure: true, hideFrom: [1, 0] }));

  // Puerta abierta 90° hacia adentro, paralela al frente del clóset
  items.push(item('Puerta (abierta)', [W - 0.08, 0, D - doorW / 2], [
    box([doorW, doorH, 0.04], [0, doorH / 2, 0], C.doorWood),
    cyl(0.03, 0.12, [doorW / 2 - 0.08, 1.0, -0.06], C.steel, { rot: [0, 0, Math.PI / 2] }),
    box([0.22, 0.07, 0.01], [0, 1.5, -0.025], '#e9a23b'),
  ], { rotY: Math.PI / 2 }));

  // ---------- clóset ----------
  const cl = [box([0.6, H - 0.08, closetLen], [0.31, (H - 0.08) / 2, 0], C.white)];
  const pw = closetLen / 3;
  for (let i = 0; i < 3; i++) {
    const z = -closetLen / 2 + pw * (i + 0.5);
    const x = i === 1 ? -0.012 : 0.012;
    cl.push(box([0.02, 2.2, pw + 0.02], [x, 1.12, z], '#fbfbfb'));
    cl.push(box([0.022, 0.42, pw + 0.02], [x, 1.35, z], C.band));
    cl.push(box([0.022, 0.3, pw + 0.02], [x, 0.5, z], C.band));
  }
  cl.push(box([0.06, 0.05, closetLen], [0, 2.26, 0], C.lightGrey));
  items.push(item('Clóset (puertas corredizas)', [W, 0, closetLen / 2], cl));

  if (!kid) {
  // ---------- escritorio ----------
  const deskL = 2.52, deskD = 0.66, deskY = 0.74;
  items.push(item('Escritorio', [deskL / 2, 0, deskD / 2 + 0.02], [
    box([deskL, 0.035, deskD], [0, deskY - 0.0175, 0], C.dark),
    box([0.04, deskY - 0.035, 0.04], [deskL / 2 - 0.04, (deskY - 0.035) / 2, deskD / 2 - 0.04], C.white),
    box([0.04, deskY - 0.035, 0.04], [deskL / 2 - 0.04, (deskY - 0.035) / 2, -deskD / 2 + 0.04], C.white),
    box([0.04, 0.04, deskD - 0.08], [deskL / 2 - 0.04, 0.02, 0], C.white),
    box([0.04, deskY - 0.035, 0.04], [-deskL / 2 + 0.04, (deskY - 0.035) / 2, deskD / 2 - 0.04], C.white),
    box([0.04, deskY - 0.035, 0.04], [-deskL / 2 + 0.04, (deskY - 0.035) / 2, -deskD / 2 + 0.04], C.white),
  ]));
  items.push(item('Cajonera 1', [0.98, 0, 0.36], drawerUnit()));
  items.push(item('Cajonera 2', [1.42, 0, 0.36], drawerUnit()));
  items.push(item('Organizador de malla', [0.66, 0, 0.3], [
    box([0.18, 0.6, 0.3], [0, 0.3, 0], '#e8e8e8', { opacity: 0.75 }),
    box([0.17, 0.01, 0.31], [0, 0.2, 0], C.lightGrey),
    box([0.17, 0.01, 0.31], [0, 0.4, 0], C.lightGrey),
  ]));

  // ---------- sobre el escritorio ----------
  items.push(item('Monitor ultrawide', [1.86, deskY, 0.22], [
    box([0.2, 0.012, 0.16], [0, 0.006, 0], C.black),
    box([0.035, 0.26, 0.035], [0, 0.13, -0.03], C.black),
    box([0.82, 0.36, 0.03], [0, 0.42, 0], C.black),
    box([0.8, 0.34, 0.005], [0, 0.42, 0.018], '#2b2d33'),
  ]));
  items.push(item('Monitor secundario', [2.4, deskY, 0.3], [
    box([0.2, 0.012, 0.16], [0, 0.006, 0], C.black),
    box([0.035, 0.2, 0.035], [0, 0.1, -0.03], C.black),
    box([0.55, 0.33, 0.03], [0, 0.34, 0], C.black),
    box([0.53, 0.31, 0.005], [0, 0.34, 0.018], '#2b2d33'),
  ], { rotY: tidy ? -0.3 : -0.5 }));
  items.push(item('Tablet en brazo', [2.3, deskY, 0.1], [
    cyl(0.02, 0.62, [0, 0.31, 0], C.lightGrey),
    box([0.27, 0.18, 0.015], [0, 0.72, 0.03], C.black, { rot: [-0.25, 0, 0] }),
  ]));
  items.push(item('Teclado', [1.9, deskY, 0.5], [
    box([0.45, 0.025, 0.15], [0, 0.0125, 0], C.black),
    box([0.42, 0.01, 0.11], [0, 0.03, -0.005], '#3d3f45'),
  ]));
  items.push(item('Mouse', [2.22, deskY, 0.52], [box([0.065, 0.035, 0.11], [0, 0.0175, 0], C.black)]));
  items.push(item('Botella morada', tidy ? [1.5, deskY, 0.55] : [2.3, deskY, 0.47], [
    cyl(0.07, 0.2, [0, 0.1, 0], C.purple), cyl(0.05, 0.04, [0, 0.22, 0], C.grey),
  ]));
  items.push(item('Laptop en soporte', [1.5, deskY, 0.25], [
    box([0.3, 0.1, 0.24], [0, 0.05, 0], C.black),
    box([0.33, 0.015, 0.23], [0, 0.11, 0], '#2a2a2c'),
    box([0.33, 0.22, 0.012], [0, 0.225, -0.115], '#2a2a2c', { rot: [-0.15, 0, 0] }),
  ]));
  items.push(item('Impresora', [1.2, deskY, 0.2], [
    box([0.36, 0.15, 0.3], [0, 0.075, 0], C.black),
    box([0.3, 0.01, 0.2], [0, 0.155, 0.02], '#34363a'),
  ]));
  items.push(item('Teléfono', [0.95, deskY, 0.2], [
    box([0.16, 0.05, 0.2], [0, 0.025, 0], C.black),
    box([0.05, 0.04, 0.2], [-0.05, 0.065, 0], '#2a2a2c'),
  ]));
  if (tidy) {
    items.push(item('Portarretratos alineados', [0.42, deskY, 0.12], [
      ...[-0.24, 0, 0.24].flatMap((x, i) => [
        box([0.16, 0.21, 0.015], [x, 0.105, 0], [C.white, C.lightGrey, C.white][i], { rot: [-0.15, 0, 0] }),
        box([0.11, 0.15, 0.017], [x, 0.105, 0.002], '#e7d3c0', { rot: [-0.15, 0, 0] }),
      ]),
    ]));
    items.push(item('Bandeja de documentos', [0.2, deskY, 0.45], [
      box([0.25, 0.012, 0.33], [0, 0.006, 0], C.black), box([0.23, 0.02, 0.31], [0, 0.022, 0], '#ffffff'),
      box([0.25, 0.012, 0.33], [0, 0.075, 0], C.black), box([0.23, 0.015, 0.31], [0, 0.088, 0], '#f3f6f1'),
      ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => box([0.012, 0.07, 0.012], [a * 0.118, 0.04, b * 0.158], C.black)),
    ]));
    items.push(item('Portalápices', [0.82, deskY, 0.14], [
      cyl(0.08, 0.1, [0, 0.05, 0], '#e9c93b'),
      cyl(0.008, 0.16, [0.01, 0.1, 0], '#4c79c9', { rot: [0.15, 0, 0.1] }), cyl(0.008, 0.16, [-0.015, 0.1, 0.01], '#e2574c', { rot: [-0.1, 0, -0.15] }),
    ]));
    items.push(item('Caja organizadora de cables', [2.05, 0, 0.14], [box([0.4, 0.14, 0.16], [0, 0.07, 0], C.white)]));
  } else
  items.push(item('Portarretratos y papeles', [0.4, deskY, 0.25], [
    box([0.22, 0.26, 0.015], [0.2, 0.2, -0.12], C.white, { rot: [-0.5, 0, 0] }),
    box([0.2, 0.22, 0.015], [-0.08, 0.2, -0.14], C.lightGrey, { rot: [-0.5, 0, 0] }),
    box([0.14, 0.18, 0.02], [-0.3, 0.09, -0.1], C.white),
    box([0.1, 0.09, 0.08], [-0.2, 0.045, -0.12], '#e9c93b'),
    box([0.3, 0.004, 0.21], [0, 0.002, 0.12], '#ffffff', { rot: [0, 0.3, 0] }),
    box([0.22, 0.004, 0.16], [0.25, 0.004, 0.16], '#e6f0ea', { rot: [0, -0.4, 0] }),
    cyl(0.08, 0.09, [0.3, 0.045, -0.02], C.grey),
  ]));

  }

  // ---------- persianas ----------
  const rb = [box([1.72, 0.1, 0.07], [0, 2.17, 0], C.blind)];
  for (let i = 0; i < 7; i++) {
    rb.push(box([1.7, 0.19, 0.02 + (i % 2) * 0.004], [0, 2.03 - i * 0.195, 0], C.blind));
    rb.push(box([1.7, 0.006, 0.03], [0, 1.935 - i * 0.195, 0], '#b3bdb8'));
  }
  items.push(item('Persiana romana', [W - 0.9, 0, 0.04], rb));
  items.push(item('Persiana enrollable (norte)', [0.62, 2.1, 0.05], [
    box([1.22, 0.22, 0.06], [0, 0, 0], '#dfe3e6'),
  ]));
  items.push(item('Persiana enrollable (oeste)', [0.05, 2.1, 0.52], [
    box([0.06, 0.22, 0.98], [0, 0, 0], '#dfe3e6'),
  ]));

  // ---------- estante con canastas ----------
  const tro = [
    box([0.02, 0.94, 0.44], [-0.21, 0.47, 0], C.white), box([0.02, 0.94, 0.44], [0.21, 0.47, 0], C.white),
    box([0.44, 0.02, 0.44], [0, 0.93, 0], C.white), box([0.44, 0.04, 0.44], [0, 0.02, 0], C.white),
    box([0.44, 0.94, 0.01], [0, 0.47, -0.215], C.white),
  ];
  for (let i = 0; i < 3; i++) tro.push(box([0.38, 0.22, 0.42], [0, 0.18 + i * 0.27, 0.01], C.blue));
  tro.push(box([0.3, 0.07, 0.25], [0.02, 0.975, 0], '#b89b7a'));
  tro.push(box([0.26, 0.05, 0.2], [-0.03, 1.035, 0], '#d9d4c6'));
  items.push(item('Estante con canastas azules', [W - 0.24, 0, 0.3], tro));

  if (!kid) {
  // ---------- sillas ----------
  items.push(item('Silla negra', tidy ? [1.95, 0, 0.92] : [2.0, 0, 1.12], chair(C.black, '#4a4d52'), { rotY: tidy ? 0 : 0.25 }));
  items.push(item('Silla gris', tidy ? [0.42, 0, 0.92] : [0.5, 0, 1.05], chair('#b9bcbf', C.black), { rotY: tidy ? 0 : -0.5 }));

  // ---------- cama + cuna ----------
  const bedL = 1.95, bedW = 1.0, by = D - bedW / 2;
  const bed = [
    box([bedL, 0.36, bedW], [0, 0.18, 0], C.white),
    box([bedL - 0.3, 0.2, 0.02], [0.05, 0.14, -bedW / 2 - 0.005], '#ffffff'),
    box([bedL - 0.04, 0.16, bedW - 0.04], [0, 0.44, 0], C.bedGreen),
  ];
  for (let i = 0; i < 26; i++) {
    const x = -bedL / 2 + 0.75 + ((i * 0.37) % 1.1);
    const z = -bedW / 2 + 0.1 + ((i * 0.23) % 0.8);
    bed.push(cyl(0.09, 0.004, [x, 0.522, z], C.spot));
  }
  items.push(item('Cama', [bedL / 2, 0, by], bed));

  const crL = 0.72, crTop = 1.3, crBase = 0.52;
  const cr = [];
  const cx = crL / 2, cz = bedW / 2 - 0.02;
  for (const [x, z] of [[-cx, -cz], [cx, -cz], [-cx, cz], [cx, cz]]) cr.push(box([0.05, crTop - crBase, 0.05], [x, (crTop + crBase) / 2, z], C.white));
  for (const y of [crTop - 0.03, crBase + 0.03]) {
    cr.push(box([crL, 0.06, 0.04], [0, y, -cz], C.white), box([crL, 0.06, 0.04], [0, y, cz], C.white));
    cr.push(box([0.04, 0.06, 2 * cz], [cx, y, 0], C.white), box([0.04, 0.06, 2 * cz], [-cx, y, 0], C.white));
  }
  for (let i = 1; i < 6; i++) cr.push(box([0.035, crTop - crBase, 0.02], [-cx + (crL * i) / 6, (crTop + crBase) / 2, -cz], C.white));
  for (let i = 1; i < 8; i++) cr.push(box([0.02, crTop - crBase, 0.035], [cx, (crTop + crBase) / 2, -cz + (2 * cz * i) / 8], C.white));
  items.push(item('Cuna (barandas)', [crL / 2 + 0.03, 0, by], cr));
  items.push(item('Peluches en la cuna', [0.39, 0.52, by], [
    sph(0.3, [-0.12, 0.15, 0.2], '#8fd3cf'), sph(0.24, [0.12, 0.12, -0.1], '#d8433a'),
    sph(0.26, [-0.1, 0.13, -0.25], '#5fa85a'), sph(0.24, [0.14, 0.12, 0.25], '#e9e9ee'),
    sph(0.22, [0.0, 0.3, 0.05], '#4c79c9'), sph(0.2, [0.15, 0.3, -0.25], '#f08a3c'),
    box([0.4, 0.12, 0.3], [-0.12, 0.08, -0.05], '#dfeccf', { rot: [0, 0.3, 0.2] }),
  ]));
  items.push(item('Morral', [1.05, 0.52, by + 0.1], [
    box([0.48, 0.2, 0.36], [0, 0.1, 0], C.black, { rot: [0, 0.3, 0] }),
    box([0.3, 0.08, 0.25], [0.02, 0.23, 0], '#232326', { rot: [0, 0.3, 0] }),
  ]));
  items.push(item('Laptop sobre la cama', [1.4, 0.52, by - 0.15], [
    box([0.36, 0.02, 0.25], [0, 0.02, 0], '#4b4f55', { rot: [0, 0.5, 0.05] }),
  ]));
  items.push(item('Coche de bebé', [2.25, 0, 2.4], [
    box([0.42, 0.5, 0.5], [0, 0.6, 0], '#2b3550'),
    box([0.42, 0.3, 0.3], [0, 0.95, 0.12], '#2b3550', { rot: [0.4, 0, 0] }),
    cyl(0.14, 0.04, [-0.2, 0.07, -0.25], C.black, { rot: [0, 0, Math.PI / 2] }),
    cyl(0.14, 0.04, [0.2, 0.07, -0.25], C.black, { rot: [0, 0, Math.PI / 2] }),
    cyl(0.14, 0.04, [-0.2, 0.07, 0.25], C.black, { rot: [0, 0, Math.PI / 2] }),
    cyl(0.14, 0.04, [0.2, 0.07, 0.25], C.black, { rot: [0, 0, Math.PI / 2] }),
    box([0.02, 0.4, 0.02], [-0.2, 0.25, 0], C.black), box([0.02, 0.4, 0.02], [0.2, 0.25, 0], C.black),
  ], { rotY: 0.4 }));

  }

  if (kid) joaquinItems(items);

  // ---------- repisas ----------
  const toys = ['#4c79c9', '#b08a5c', '#e9e9ee', '#9aa0a8', '#6cc24a', '#e2574c', '#f2c94c'];
  items.push(item('Repisa larga (sur)', [0.75, 1.82, D - 0.11], [
    box([1.0, 0.04, 0.22], [0, 0, 0], C.shelf),
    ...plushies(5, 0.9, 0.02, ['#9aa0a8', '#4c79c9', '#b08a5c', '#f3f3f3', '#8fbf5a']),
  ], { hideFrom: [0, 1] }));
  [1.15, 1.5, 1.83].forEach((y, i) => {
    items.push(item(`Repisa pequeña ${i + 1} (sur)`, [1.8, y, D - 0.1], [
      box([0.62, 0.03, 0.2], [0, 0, 0], C.shelf),
      ...plushies(3, 0.55, 0.015, toys.slice(i * 2).concat(toys)),
    ], { hideFrom: [0, 1] }));
  });
  items.push(item('Repisa doble (oeste)', [0.11, 1.62, 2.35], [
    box([0.2, 0.03, 0.8], [0, 0, 0], C.shelf), box([0.2, 0.03, 0.8], [0, 0.1, 0], C.shelf),
    ...[0, 1, 2, 3].map((i) => sph(0.15, [0, 0.19, -0.3 + i * 0.2], ['#e2c48f', '#3f8f4f', '#3b5fa8', '#5aa64b'][i])),
    box([0.16, 0.12, 0.26], [0, 0.175, 0.25], '#d9e8ef', { opacity: 0.6 }),
  ], { hideFrom: [-1, 0] }));

  // ---------- decoración de muros ----------
  items.push(item('Vinilo: rama y monos', [0.8, 1.2, D - 0.012], [
    box([1.3, 0.05, 0.006], [0, 0.12, 0], '#4a3f3a', { rot: [0, 0, 0.12] }),
    ...[-0.45, 0.0, 0.42].flatMap((x, i) => [
      cyl(0.2, 0.006, [x, -0.02 + i * 0.07, 0], C.brown, { rot: [Math.PI / 2, 0, 0] }),
      cyl(0.13, 0.008, [x, -0.02 + i * 0.07, -0.002], '#ead9c3', { rot: [Math.PI / 2, 0, 0] }),
    ]),
    ...[-0.6, -0.2, 0.25, 0.6].map((x, i) => box([0.1, 0.05, 0.006], [x, 0.22 + i * 0.03, 0], i % 2 ? '#8ccf5a' : '#2f9e6a', { rot: [0, 0, 0.6] })),
  ], { hideFrom: [0, 1] }));
  items.push(item('Vinilo: búho', [1.3, 0.85, D - 0.012], [
    cyl(0.3, 0.006, [0, 0, 0], '#f2d23c', { rot: [Math.PI / 2, 0, 0] }),
    cyl(0.09, 0.008, [-0.06, 0.04, -0.002], '#ffffff', { rot: [Math.PI / 2, 0, 0] }),
    cyl(0.09, 0.008, [0.06, 0.04, -0.002], '#ffffff', { rot: [Math.PI / 2, 0, 0] }),
    cyl(0.04, 0.01, [-0.06, 0.04, -0.004], C.black, { rot: [Math.PI / 2, 0, 0] }),
    cyl(0.04, 0.01, [0.06, 0.04, -0.004], C.black, { rot: [Math.PI / 2, 0, 0] }),
  ], { hideFrom: [0, 1] }));
  items.push(item('Vinilo: cocodrilo', [0.012, 1.38, 2.45], [
    box([0.006, 0.07, 0.6], [0, 0, 0], '#7fc25a'),
    box([0.006, 0.05, 0.14], [0, 0.04, -0.2], '#7fc25a'),
  ], { hideFrom: [-1, 0] }));
  const fr = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const z = -0.33 + c * 0.22, y = r * 0.25;
    fr.push(box([0.015, 0.2, 0.16], [0, y, z], '#9aa3a8'));
    fr.push(box([0.017, 0.14, 0.1], [0.002, y, z], ['#e7d3c0', '#d9c1ad', '#efe0d2'][(r + c) % 3]));
  }
  items.push(item('Cuadros de fotos', [0.012, 1.3, 1.45], fr, { hideFrom: [-1, 0] }));
  items.push(item('Reloj', [0.02, 1.95, 1.3], [
    cyl(0.34, 0.02, [0, 0, 0], C.steel, { rot: [0, 0, Math.PI / 2] }),
    cyl(0.12, 0.025, [0.003, 0, 0], C.black, { rot: [0, 0, Math.PI / 2] }),
    box([0.004, 0.012, 0.13], [0.016, 0, 0.05], '#ffffff', { rot: [0.5, 0, 0] }),
  ], { hideFrom: [-1, 0] }));

  return items;
}

// ---------- diseño: habitación de Joaquín (Montessori) ----------
function joaquinItems(items) {
  const wood = '#dcbf93', woodDark = '#c9a877';

  // Cama casita a ras de piso, en la misma esquina donde estaba la cama con cuna
  const L = 1.9, Wd = 1.0, eave = 1.05, ridge = 1.5, hz = Wd / 2 - 0.025, hx = L / 2 - 0.025;
  const rl = Math.hypot(hz, ridge - eave), ra = Math.atan2(ridge - eave, hz);
  const bed = [
    box([L, 0.08, Wd], [0, 0.06, 0], wood),
    box([L - 0.1, 0.12, Wd - 0.1], [0, 0.16, 0], C.bedGreen),
    box([0.4, 0.08, 0.6], [-L / 2 + 0.3, 0.26, 0], '#ffffff'),
    box([L, 0.05, 0.05], [0, eave, -hz], wood), box([L, 0.05, 0.05], [0, eave, hz], wood),
    box([L, 0.05, 0.05], [0, ridge, 0], wood),
    box([0.03, 0.3, Wd - 0.1], [-hx, 0.37, 0], wood),
    box([0.9, 0.05, 0.03], [-L / 2 + 0.47, 0.44, -hz], wood),
  ];
  for (const x of [-hx, hx]) {
    for (const z of [-hz, hz]) bed.push(box([0.05, eave, 0.05], [x, eave / 2, z], wood));
    bed.push(box([0.05, 0.05, rl], [x, (eave + ridge) / 2, hz / 2], wood, { rot: [ra, 0, 0] }));
    bed.push(box([0.05, 0.05, rl], [x, (eave + ridge) / 2, -hz / 2], wood, { rot: [-ra, 0, 0] }));
  }
  for (let i = 1; i < 6; i++) bed.push(box([0.03, 0.22, 0.02], [-L / 2 + 0.03 + i * 0.15, 0.31, -hz], wood));
  for (let i = 0; i < 18; i++) bed.push(cyl(0.09, 0.004, [-L / 2 + 0.7 + ((i * 0.37) % 1.05), 0.222, -0.38 + ((i * 0.23) % 0.76)], C.spot));
  items.push(item('Cama Montessori (casita)', [L / 2 + 0.03, 0, D - Wd / 2 - 0.01], bed));
  items.push(item('Peluches en la cama', [0.75, 0.22, D - 0.3], [
    sph(0.26, [0, 0.13, 0], '#8fd3cf'), sph(0.16, [0, 0.31, 0], '#8fd3cf'),
    sph(0.22, [0.3, 0.11, 0.02], '#4c79c9'), sph(0.14, [0.3, 0.26, 0.02], '#4c79c9'),
    sph(0.2, [0.56, 0.1, 0], '#d8433a'), sph(0.13, [0.56, 0.24, 0], '#d8433a'),
  ]));

  // Zona de juego
  items.push(item('Tapete de juego', [1.55, 0, 1.15], [
    cyl(1.6, 0.012, [0, 0.006, 0], '#f1e6cf'), cyl(1.2, 0.014, [0, 0.007, 0], '#bfe3c4'),
  ]));
  const chairKid = (x, z, rot) => items.push(item('Sillita', [x, 0, z], [
    box([0.28, 0.03, 0.28], [0, 0.26, 0], wood),
    box([0.28, 0.24, 0.025], [0, 0.42, 0.13], wood),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => box([0.03, 0.26, 0.03], [a * 0.12, 0.13, b * 0.12], woodDark)),
  ], { rotY: rot }));
  items.push(item('Mesita de actividades', [1.25, 0, 1.0], [
    box([0.6, 0.03, 0.5], [0, 0.445, 0], '#ffffff'),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => box([0.04, 0.43, 0.04], [a * 0.26, 0.215, b * 0.21], wood)),
    box([0.21, 0.004, 0.15], [-0.1, 0.462, 0], '#fff7d6', { rot: [0, 0.2, 0] }),
    cyl(0.07, 0.08, [0.18, 0.5, -0.12], '#e2574c'),
  ]));
  chairKid(1.25, 1.42, 0);
  chairKid(0.8, 1.0, -Math.PI / 2);

  // Rincón de lectura junto a la pared de las fotos
  const rack = [box([0.02, 0.75, 0.8], [-0.07, 0.375, 0], wood), box([0.16, 0.75, 0.02], [0, 0.375, -0.4], wood), box([0.16, 0.75, 0.02], [0, 0.375, 0.4], wood)];
  const bookCols = ['#e2574c', '#4c79c9', '#f2c94c', '#6cc24a', '#f08a3c', '#9b6fd0'];
  [0.06, 0.3, 0.54].forEach((y, r) => {
    rack.push(box([0.14, 0.02, 0.78], [0, y, 0], wood), box([0.015, 0.07, 0.78], [0.07, y + 0.035, 0], wood));
    for (let i = 0; i < 4; i++) rack.push(box([0.02, 0.2, 0.16], [0.02 + (i % 2) * 0.02, y + 0.11, -0.28 + i * 0.19], bookCols[(r * 4 + i) % 6], { rot: [0, 0, -0.12] }));
  });
  items.push(item('Librero frontal', [0.09, 0, 1.45], rack));
  items.push(item('Puf de lectura', [0.5, 0, 0.5], [
    box([0.7, 0.3, 0.7], [0, 0.15, 0], '#7fb7d9'), sph(0.34, [-0.12, 0.38, -0.12], '#f2c94c'),
  ]));
  items.push(item('Lámpara de noche', [0.2, 0, 1.0], [
    cyl(0.12, 0.03, [0, 0.015, 0], woodDark), cyl(0.02, 0.5, [0, 0.28, 0], woodDark), sph(0.2, [0, 0.6, 0], '#fff2c2'),
  ]));

  // Repisa baja de juguetes (junto al estante de canastas que ya existía)
  const low = [
    box([0.9, 0.02, 0.3], [0, 0.44, 0], wood), box([0.9, 0.02, 0.3], [0, 0.22, 0], wood), box([0.9, 0.03, 0.3], [0, 0.015, 0], wood),
    box([0.02, 0.45, 0.3], [-0.44, 0.225, 0], wood), box([0.02, 0.45, 0.3], [0.44, 0.225, 0], wood), box([0.02, 0.45, 0.3], [0, 0.225, 0], wood),
    box([0.9, 0.45, 0.01], [0, 0.225, -0.145], wood),
    box([0.3, 0.14, 0.22], [-0.22, 0.1, 0.02], '#e9c93b'), sph(0.16, [0.22, 0.11, 0], '#e2574c'),
    box([0.12, 0.12, 0.12], [-0.3, 0.29, 0], '#4c79c9'), box([0.12, 0.12, 0.12], [-0.14, 0.29, 0.02], '#6cc24a'),
    cyl(0.1, 0.16, [0.14, 0.31, 0], '#f08a3c'), cyl(0.1, 0.12, [0.3, 0.29, 0], '#9b6fd0'),
    box([0.25, 0.1, 0.12], [-0.2, 0.5, 0], '#d8433a'), sph(0.14, [0.22, 0.52, 0], '#8fd3cf'),
  ];
  items.push(item('Repisa baja de juguetes', [1.6, 0, 0.19], low));
  const tro2 = [
    box([0.02, 0.94, 0.44], [-0.21, 0.47, 0], C.white), box([0.02, 0.94, 0.44], [0.21, 0.47, 0], C.white),
    box([0.44, 0.02, 0.44], [0, 0.93, 0], C.white), box([0.44, 0.04, 0.44], [0, 0.02, 0], C.white),
    box([0.44, 0.94, 0.01], [0, 0.47, -0.215], C.white),
    ...[0, 1, 2].map((i) => box([0.38, 0.22, 0.42], [0, 0.18 + i * 0.27, 0.01], ['#bfe3c4', '#f2c94c', C.blue][i])),
  ];
  items.push(item('Estante con canastas 2', [W - 0.7, 0, 0.3], tro2));

  // Percha a la altura del niño
  items.push(item('Percha baja (ropa de Joaquín)', [0.012, 0.95, 1.05], [
    box([0.02, 0.08, 0.5], [0, 0, 0], wood),
    ...[-0.18, 0, 0.18].map((z) => cyl(0.025, 0.06, [0.035, 0, z], woodDark, { rot: [0, 0, Math.PI / 2] })),
  ], { hideFrom: [-1, 0] }));
}
