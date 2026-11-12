import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { ROOM, defaultItems } from './room.js';

const STORE = 'cuarto3d-v1';
const $ = (id) => document.getElementById(id);
const view = $('view');

// ---------- escena ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
view.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e9edf0');
const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 100);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.maxPolarAngle = Math.PI / 2 - 0.02;

scene.add(new THREE.HemisphereLight('#ffffff', '#b9b2a8', 1.5));
const sun = new THREE.DirectionalLight('#ffffff', 1.6);
sun.position.set(-2.5, 6, -1.5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 15 });
sun.shadow.bias = -0.0005;
sun.target.position.set(1.5, 0, 1.5);
scene.add(sun, sun.target);

const root = new THREE.Group();
root.name = 'Cuarto';
scene.add(root);

const tc = new TransformControls(camera, renderer.domElement);
tc.setSize(0.8);
scene.add(tc.getHelper());
const selBox = new THREE.BoxHelper(new THREE.Object3D(), '#ff7a00');
selBox.visible = false;
scene.add(selBox);

function resetCamera(top = false) {
  const { W, D } = ROOM;
  if (top) camera.position.set(W / 2, 7.5, D / 2 + 0.01);
  else camera.position.set(2.3, 4.6, 7.0);
  orbit.target.set(W / 2, top ? 0 : 0.8, D / 2 - (top ? 0 : 0.2));
  orbit.update();
}

// ---------- estado ----------
let items = [];
let selectedId = null;
const groups = new Map();
const undoStack = [];
let autoHide = true;

const geoCache = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
  sphere: new THREE.SphereGeometry(0.5, 24, 16),
};

function buildGroup(it) {
  const g = new THREE.Group();
  g.name = it.name;
  g.userData.itemId = it.id;
  for (const p of it.parts) {
    const mat = new THREE.MeshStandardMaterial({
      color: p.color, roughness: 0.75,
      transparent: p.opacity != null && p.opacity < 1, opacity: p.opacity ?? 1,
    });
    const m = new THREE.Mesh(geoCache[p.shape] || geoCache.box, mat);
    m.scale.set(...p.size);
    m.position.set(...p.pos);
    if (p.rot) m.rotation.set(...p.rot);
    m.castShadow = !mat.transparent;
    m.receiveShadow = true;
    g.add(m);
  }
  applyTransform(it, g);
  return g;
}

function applyTransform(it, g) {
  g.position.set(...it.pos);
  g.rotation.set(0, it.rotY || 0, 0);
  g.scale.set(...(it.scale || [1, 1, 1]));
  g.visible = it.visible !== false;
}

function rebuildAll() {
  tc.detach();
  for (const g of groups.values()) root.remove(g);
  groups.clear();
  for (const it of items) {
    const g = buildGroup(it);
    groups.set(it.id, g);
    root.add(g);
  }
  if (!items.find((i) => i.id === selectedId)) selectedId = null;
  select(selectedId);
  renderList();
}

function rebuildOne(it) {
  const old = groups.get(it.id);
  if (old) root.remove(old);
  const g = buildGroup(it);
  groups.set(it.id, g);
  root.add(g);
  if (selectedId === it.id) tc.attach(g);
}

const getItem = (id) => items.find((i) => i.id === id);
const save = () => localStorage.setItem(STORE, JSON.stringify(items));
function pushUndo() {
  undoStack.push(JSON.stringify(items));
  if (undoStack.length > 60) undoStack.shift();
}
function undo() {
  const s = undoStack.pop();
  if (!s) return;
  items = JSON.parse(s);
  rebuildAll();
  save();
}

// ---------- selección ----------
function select(id) {
  selectedId = id;
  const g = id && groups.get(id);
  if (g) tc.attach(g); else tc.detach();
  selBox.visible = !!g;
  if (g) selBox.setFromObject(g);
  document.querySelectorAll('#list li').forEach((li) => li.classList.toggle('sel', li.dataset.id === id));
  renderProps();
}

const ray = new THREE.Raycaster();
let downAt = null;
renderer.domElement.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 4 || tc.dragging || tc.axis) return;
  const r = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const hits = ray.intersectObjects(root.children, true).filter((h) => h.object.parent.visible);
  const lockStruct = $('lockStruct').checked;
  for (const h of hits) {
    const id = h.object.parent.userData.itemId;
    if (lockStruct && getItem(id)?.structure) continue;
    return select(id);
  }
  select(null);
});

tc.addEventListener('dragging-changed', (e) => {
  orbit.enabled = !e.value;
  if (e.value) pushUndo(); else save();
});
tc.addEventListener('objectChange', () => {
  const it = getItem(selectedId), g = groups.get(selectedId);
  if (!it || !g) return;
  it.pos = g.position.toArray().map(r3);
  it.rotY = r3(new THREE.Euler().setFromQuaternion(g.quaternion, 'YXZ').y);
  it.scale = g.scale.toArray().map(r3);
  selBox.setFromObject(g);
  renderProps(true);
});
const r3 = (v) => Math.round(v * 1000) / 1000;

function setMode(m) {
  tc.setMode(m);
  tc.showX = tc.showZ = m !== 'rotate';
  tc.showY = true;
  document.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
}
function setSnap(on) {
  tc.setTranslationSnap(on ? 0.05 : null);
  tc.setRotationSnap(on ? THREE.MathUtils.degToRad(15) : null);
  tc.setScaleSnap(on ? 0.05 : null);
}

// ---------- panel ----------
function renderList() {
  const ul = $('list');
  ul.innerHTML = '';
  for (const it of items) {
    const li = document.createElement('li');
    li.dataset.id = it.id;
    li.textContent = it.name;
    if (it.visible === false) li.classList.add('hid');
    if (it.id === selectedId) li.classList.add('sel');
    li.onclick = () => select(it.id);
    ul.appendChild(li);
  }
}

function renderProps(valuesOnly = false) {
  const it = getItem(selectedId);
  $('props').hidden = !it;
  $('noSel').hidden = !!it;
  if (!it) return;
  const set = (id, v) => { if (document.activeElement !== $(id)) $(id).value = v; };
  set('pName', it.name);
  ['x', 'y', 'z'].forEach((a, i) => { set('p' + a, it.pos[i]); set('s' + a, it.scale[i]); });
  set('pRot', Math.round(THREE.MathUtils.radToDeg(it.rotY || 0)));
  $('pVis').checked = it.visible !== false;
  const box = new THREE.Box3().setFromObject(groups.get(it.id));
  const sz = box.getSize(new THREE.Vector3());
  $('dims').textContent = `${sz.x.toFixed(2)} × ${sz.z.toFixed(2)} × ${sz.y.toFixed(2)} m (ancho × fondo × alto)`;
  if (valuesOnly) return;
  const cols = $('colors');
  cols.innerHTML = '';
  [...new Set(it.parts.map((p) => p.color))].forEach((c) => {
    const inp = document.createElement('input');
    inp.type = 'color';
    inp.value = c;
    let cur = c, pushed = false;
    inp.oninput = () => {
      if (!pushed) { pushUndo(); pushed = true; }
      it.parts.forEach((p) => { if (p.color === cur) p.color = inp.value; });
      cur = inp.value;
      rebuildOne(it);
      save();
    };
    cols.appendChild(inp);
  });
}

function editSelected(fn) {
  const it = getItem(selectedId);
  if (!it) return;
  pushUndo();
  fn(it);
  applyTransform(it, groups.get(it.id));
  selBox.setFromObject(groups.get(it.id));
  save();
  renderProps(true);
}
const num = (id, d = 0) => { const v = parseFloat($(id).value); return Number.isFinite(v) ? v : d; };
['x', 'y', 'z'].forEach((a, i) => {
  $('p' + a).onchange = () => editSelected((it) => { it.pos[i] = num('p' + a); });
  $('s' + a).onchange = () => editSelected((it) => { it.scale[i] = Math.max(0.01, num('s' + a, 1)); });
});
$('pRot').onchange = () => editSelected((it) => { it.rotY = THREE.MathUtils.degToRad(num('pRot')); });
$('pVis').onchange = () => { editSelected((it) => { it.visible = $('pVis').checked; }); renderList(); };
$('pName').onchange = () => { editSelected((it) => { it.name = $('pName').value || 'Objeto'; }); groups.get(selectedId).name = getItem(selectedId).name; renderList(); };

const newId = () => 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
function addPrimitive(shape) {
  pushUndo();
  const names = { box: 'Caja', cyl: 'Cilindro', sphere: 'Esfera' };
  const it = {
    id: newId(), name: names[shape] + ' nueva', pos: [ROOM.W / 2, 0, ROOM.D / 2], rotY: 0, scale: [1, 1, 1], visible: true,
    parts: [{ shape, size: [0.4, 0.4, 0.4], pos: [0, 0.2, 0], color: '#e08a3c' }],
  };
  items.push(it);
  rebuildAll();
  select(it.id);
  save();
}
function duplicate() {
  const it = getItem(selectedId);
  if (!it) return;
  pushUndo();
  const c = JSON.parse(JSON.stringify(it));
  c.id = newId();
  c.name = it.name + ' (copia)';
  c.pos[0] += 0.3;
  c.pos[2] += 0.3;
  delete c.hideFrom;
  items.push(c);
  rebuildAll();
  select(c.id);
  save();
}
function remove() {
  if (!getItem(selectedId)) return;
  pushUndo();
  items = items.filter((i) => i.id !== selectedId);
  selectedId = null;
  rebuildAll();
  save();
}

function download(name, data, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

$('bAddBox').onclick = () => addPrimitive('box');
$('bAddCyl').onclick = () => addPrimitive('cyl');
$('bAddSph').onclick = () => addPrimitive('sphere');
$('bDup').onclick = duplicate;
$('bDel').onclick = remove;
$('bUndo').onclick = undo;
$('bTop').onclick = () => resetCamera(true);
$('bPersp').onclick = () => resetCamera(false);
$('snap').onchange = () => setSnap($('snap').checked);
$('autoHide').onchange = () => { autoHide = $('autoHide').checked; };
document.querySelectorAll('[data-mode]').forEach((b) => { b.onclick = () => setMode(b.dataset.mode); });
$('bReset').onclick = () => {
  if (!confirm('¿Restablecer el cuarto al modelo original? Se perderán tus cambios.')) return;
  pushUndo();
  items = defaultItems();
  selectedId = null;
  rebuildAll();
  save();
};
$('bJson').onclick = () => download('cuarto.json', JSON.stringify(items, null, 1), 'application/json');
$('fImport').onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!Array.isArray(data) || !data.every((i) => i.id && Array.isArray(i.parts))) throw new Error('formato');
    pushUndo();
    items = data;
    selectedId = null;
    rebuildAll();
    save();
  } catch { alert('El archivo no es un JSON de cuarto válido.'); }
  e.target.value = '';
};
$('bGlb').onclick = () => {
  const hidden = [];
  root.children.forEach((g) => { if (!g.visible && getItem(g.userData.itemId)?.visible !== false) { g.visible = true; hidden.push(g); } });
  new GLTFExporter().parse(root, (buf) => {
    hidden.forEach((g) => { g.visible = false; });
    download('cuarto.glb', buf, 'model/gltf-binary');
  }, (err) => alert('No se pudo exportar: ' + err), { binary: true, onlyVisible: true });
};

addEventListener('keydown', (e) => {
  if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); undo(); }
  else if ((e.ctrlKey || e.metaKey) && k === 'd') { e.preventDefault(); duplicate(); }
  else if (k === 'w') setMode('translate');
  else if (k === 'e') setMode('rotate');
  else if (k === 'r') setMode('scale');
  else if (k === 'delete' || k === 'backspace') remove();
  else if (k === 'escape') select(null);
});

// ---------- bucle ----------
function resize() {
  const w = view.clientWidth, h = view.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(view);

const tmp = new THREE.Vector3();
function tick() {
  orbit.update();
  for (const it of items) {
    if (!it.hideFrom) continue;
    const g = groups.get(it.id);
    if (it.visible === false) { g.visible = false; continue; }
    tmp.copy(camera.position).sub(g.position);
    g.visible = !autoHide || it.id === selectedId || tmp.x * it.hideFrom[0] + tmp.z * it.hideFrom[1] < 0;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

try { items = JSON.parse(localStorage.getItem(STORE)) || defaultItems(); } catch { items = defaultItems(); }
resize();
resetCamera();
setMode('translate');
setSnap(true);
rebuildAll();
tick();
window.__cuarto = { get items() { return items; }, select };
