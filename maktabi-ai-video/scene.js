/* «مكتبي AI» — deterministic animation timeline (rendered frame-by-frame by render.js) */
(function () {
'use strict';
const TL = window.TL, SUBS = window.SUBS;
const TOT = TL.duration;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const K = k => SUBS[k].start, KE = k => SUBS[k].end;

// ---------------------------------------------------------------- seeded random
let _s = 20261101;
const rnd = () => { _s |= 0; _s = _s + 0x6D2B79F5 | 0; let t = Math.imul(_s ^ _s >>> 15, 1 | _s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const R = (a, b) => a + (b - a) * rnd();

// ---------------------------------------------------------------- icons
const P = {
  sparkle: '<path fill="currentColor" stroke="none" d="M12 1.8l2.1 7.1 7.1 2.1-7.1 2.1L12 20.2l-2.1-7.1L2.8 11l7.1-2.1z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5" opacity=".5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  bell: '<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.8 1.8H4.2z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1.1"/><circle cx="4.8" cy="12" r="1.1"/><circle cx="4.8" cy="17.5" r="1.1"/>',
  userCheck: '<circle cx="9" cy="8" r="4"/><path d="M2.5 21c.4-3.8 3-6 6.5-6s6.1 2.2 6.5 6"/><path d="M15.5 11.5l2.2 2.2 4.3-4.6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  users: '<circle cx="9" cy="8" r="3.6"/><path d="M2.5 20c.4-3.6 3-5.6 6.5-5.6s6.1 2 6.5 5.6"/><circle cx="17" cy="9" r="2.8"/><path d="M17.5 14.2c2.4.3 3.8 2 4 4.6"/>',
  receipt: '<path d="M6 2.8h12v18.4l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 15.5h4"/>',
  scale: '<path d="M12 3v18M6 21h12M5 7h14"/><path d="M5 7l-3 6.5a3.2 3.2 0 0 0 6 0zM19 7l-3 6.5a3.2 3.2 0 0 0 6 0z"/>',
  mosque: '<path d="M12 2v2.2"/><path d="M12 4.2c-3.4 2-6 3.9-6 7.3h12c0-3.4-2.6-5.3-6-7.3z"/><path d="M5 11.5h14V21H5z"/><path d="M10 21v-4.2a2 2 0 0 1 4 0V21"/><path d="M2.5 21V9.5M21.5 21V9.5"/>',
  contract: '<path d="M7 2.8h7.5l4.5 4.5v13.9H7z"/><path d="M14.5 2.8v4.5H19"/><path d="M10 12h6M10 15.5h6M10 19h3"/>',
  doc: '<path d="M6.5 2.8h8l4.5 4.5v13.9H6.5z"/><path d="M14.5 2.8v4.5H19"/><path d="M9.5 12.5h6M9.5 16h6"/>',
  shield: '<path d="M12 2.8l8 3v6.2c0 5-3.4 8.2-8 9.4-4.6-1.2-8-4.4-8-9.4V5.8z"/>',
  shieldCheck: '<path d="M12 2.8l8 3v6.2c0 5-3.4 8.2-8 9.4-4.6-1.2-8-4.4-8-9.4V5.8z"/><path d="M8.5 12l2.4 2.4 4.6-4.8"/>',
  key: '<circle cx="8" cy="15" r="4.2"/><path d="M11 12l9-9M16.5 6.5l3 3M14 9l2 2"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/>',
  cloud: '<path d="M7 18.5h10.2a4.3 4.3 0 0 0 .6-8.5A6.2 6.2 0 0 0 6 9.3a4.6 4.6 0 0 0 1 9.2z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18" stroke-width="2.8"/>',
  check: '<path d="M4.5 12.5l5 5 10-11" stroke-width="2.4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>',
  pen: '<path d="M4 20l1-4.5L16 4.5l3.5 3.5L8.5 19z"/><path d="M13.5 7l3.5 3.5"/>',
  folder: '<path d="M3 6.5h6.2l2 2.2H21v11H3z"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.2h5V7M6.5 7l1 13.5h9l1-13.5"/>',
  pin: '<path d="M9 2.8h6l-1 6.5 4 4H6l4-4z"/><path d="M12 13.3V21"/>',
  database: '<ellipse cx="12" cy="5.8" rx="8" ry="3"/><path d="M4 5.8v12.4c0 1.7 3.6 3 8 3s8-1.3 8-3V5.8"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  flow: '<rect x="3" y="3.5" width="7" height="5.5" rx="1.5"/><rect x="14" y="15" width="7" height="5.5" rx="1.5"/><path d="M6.5 9v4.5a2 2 0 0 0 2 2H14"/><path d="M12 13.5l2 2-2 2"/>',
  link: '<path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1.2 1.2"/><path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1.2-1.2"/>',
  send: '<path d="M3 11.5L21 3l-8.5 18-2.2-7.3z"/><path d="M10.3 13.7L21 3"/>',
  inbox: '<path d="M3 13.5l3-8.5h12l3 8.5V20H3z"/><path d="M3 13.5h5l1.2 2.3h5.6l1.2-2.3h5"/>',
  tasks: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 12l2.6 2.6L16 9"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
  chart: '<path d="M4 20.5V11M10 20.5V4.5M16 20.5V13M21.5 20.5H2.5"/>',
  flag: '<path d="M5 21.5V3.5h11.5l-2 4 2 4H5"/>',
  building: '<path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10"/><path d="M2.5 10L12 3.5 21.5 10z"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  sort: '<path d="M7 4v16M3.5 16.5L7 20l3.5-3.5M13 6h8M13 11h6M13 16h4"/>',
  block: '<circle cx="12" cy="12" r="9"/><path d="M5.7 5.7l12.6 12.6"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20.5 3.8v4.4h-4.4"/>',
};
const icon = n => {
  if (n === 'cursor') return '<svg viewBox="0 0 24 24" style="width:100%;height:100%"><path d="M4 2.5l15 9.2-6.6 1.4 3.9 7.3-3 1.6-3.9-7.4L4 19.3z" fill="#fff" stroke="#0b2f3d" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  if (n === 'lockBig') return `<svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible">
    <defs><linearGradient id="lkg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dc9c"/><stop offset=".5" stop-color="#d0a94e"/><stop offset="1" stop-color="#9c7220"/></linearGradient>
    <linearGradient id="lks" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9cf8c"/><stop offset="1" stop-color="#a77d26"/></linearGradient></defs>
    <path d="M30 46V32a20 20 0 0 1 40 0v14" fill="none" stroke="url(#lks)" stroke-width="10" stroke-linecap="round"/>
    <rect x="18" y="44" width="64" height="50" rx="11" fill="url(#lkg)" stroke="#fff6dc" stroke-width="2"/>
    <rect x="18" y="44" width="64" height="14" rx="7" fill="#fff" opacity=".18"/>
    <circle cx="50" cy="65" r="7.5" fill="#24343a"/><path d="M46.5 68h7l2 14h-11z" fill="#24343a"/></svg>`;
  return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${P[n] || ''}</svg>`;
};
$$('[data-icon]').forEach(el => {
  el.innerHTML = icon(el.dataset.icon) + el.innerHTML;
  if (!el.classList.contains('ic') && !el.style.width && !el.closest('.pill,.chip,.it,.prompt,.ctx,.task,.apps') && el.dataset.icon !== 'cursor') el.style.display = 'inline-flex';
});
$$('.pill > span[data-icon], .prompt > span[data-icon], .it > span[data-icon], .apps > span[data-icon]').forEach(el => { el.style.display = 'inline-flex'; });

// ---------------------------------------------------------------- AI core emblem
let coreN = 0;
function coreSVG(kind) {
  const id = 'c' + (coreN++);
  const star = (s, r) => { // two squares → 8-point star
    const a = [], b = [];
    for (let i = 0; i < 4; i++) { const t1 = Math.PI / 4 + i * Math.PI / 2, t2 = i * Math.PI / 2; a.push([Math.cos(t1) * s, Math.sin(t1) * s]); b.push([Math.cos(t2) * r, Math.sin(t2) * r]); }
    return [a, b].map(p => 'M' + p.map(q => q.map(v => v.toFixed(1)).join(' ')).join('L') + 'Z');
  };
  const [sa, sb] = star(56, 56);
  let spokes = '';
  for (let i = 0; i < 8; i++) {
    const t = (i * 45 + 22.5) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    const r1 = 50, r2 = 72, r3 = 80;
    const tt = t + (i % 2 ? 0.12 : -0.12);
    spokes += `<path d="M${(c * r1).toFixed(1)} ${(s * r1).toFixed(1)}L${(c * r2).toFixed(1)} ${(s * r2).toFixed(1)}L${(Math.cos(tt) * r3).toFixed(1)} ${(Math.sin(tt) * r3).toFixed(1)}"/><circle cx="${(Math.cos(tt) * r3).toFixed(1)}" cy="${(Math.sin(tt) * r3).toFixed(1)}" r="2.6" fill="#e3c47e" stroke="none"/>`;
  }
  let ticks = '';
  for (let i = 0; i < 72; i++) { const t = i * 5 * Math.PI / 180, r1 = 93, r2 = i % 6 ? 96 : 100; ticks += `<line x1="${(Math.cos(t) * r1).toFixed(1)}" y1="${(Math.sin(t) * r1).toFixed(1)}" x2="${(Math.cos(t) * r2).toFixed(1)}" y2="${(Math.sin(t) * r2).toFixed(1)}"/>`; }
  const full = kind !== 'mini';
  return `<svg viewBox="-110 -110 220 220">
  <defs>
    <radialGradient id="${id}g"><stop offset="0" stop-color="#2fc6dc" stop-opacity=".55"/><stop offset=".55" stop-color="#2fc6dc" stop-opacity=".15"/><stop offset="1" stop-color="#2fc6dc" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#13806a"/><stop offset=".55" stop-color="#0e7f8c"/><stop offset="1" stop-color="#1b5fae"/></linearGradient>
    <linearGradient id="${id}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e3a8"/><stop offset=".6" stop-color="#d4ae55"/><stop offset="1" stop-color="#a77d26"/></linearGradient>
  </defs>
  ${full ? `<circle class="cglow" r="108" fill="url(#${id}g)"/>
  <g class="r1" stroke="#c39a3d" stroke-width="1.3" fill="none" opacity=".85">${ticks}</g>
  <g class="r2"><circle r="86" fill="none" stroke="#0e8a8c" stroke-width="1.4" stroke-dasharray="22 9 4 9" opacity=".75"/></g>
  <g class="r3" stroke="#c39a3d" stroke-width="1.6" fill="none" opacity=".9">${spokes}</g>` : ''}
  <g class="star">
    <path d="${sa}" fill="url(#${id}s)" stroke="#e3c47e" stroke-width="${full ? 2.6 : 5}" stroke-linejoin="round"/>
    <path d="${sb}" fill="url(#${id}s)" stroke="#e3c47e" stroke-width="${full ? 2.6 : 5}" stroke-linejoin="round"/>
    <circle r="33" fill="#0a4652" stroke="#e3c47e" stroke-width="${full ? 2 : 4}"/>
  </g>
  <path class="spark" fill="url(#${id}o)" d="M0 -24L5.3 -5.3 24 0 5.3 5.3 0 24 -5.3 5.3 -24 0 -5.3 -5.3Z"/>
</svg>`;
}
$$('[data-core]').forEach(el => { el.innerHTML = coreSVG(el.dataset.core); });

function ringSVG(kind) {
  if (kind === 'dash') return '<svg viewBox="-100 -100 200 200" style="width:100%;height:100%;overflow:visible"><circle r="97" fill="none" stroke="#c39a3d" stroke-width="1.4" stroke-dasharray="30 10 6 10" opacity=".85"/><circle r="91" fill="none" stroke="#0e8a8c" stroke-width=".9" stroke-dasharray="2 5" opacity=".7"/></svg>';
  let t = ''; for (let i = 0; i < 90; i++) { const a = i * 4 * Math.PI / 180, r2 = i % 5 ? 95 : 99; t += `<line x1="${(Math.cos(a) * 91).toFixed(1)}" y1="${(Math.sin(a) * 91).toFixed(1)}" x2="${(Math.cos(a) * r2).toFixed(1)}" y2="${(Math.sin(a) * r2).toFixed(1)}"/>`; }
  return `<svg viewBox="-100 -100 200 200" style="width:100%;height:100%;overflow:visible"><g stroke="#c39a3d" stroke-width="1.2" opacity=".8">${t}</g></svg>`;
}
$$('[data-ring]').forEach(el => { el.innerHTML = ringSVG(el.dataset.ring); });

// ---------------------------------------------------------------- AI background layer
const ai = $('#aiSvg');
const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
ai.innerHTML = `<defs>
  <pattern id="hexp" width="48" height="41.57" patternUnits="userSpaceOnUse"><path d="M12 0h24l12 20.78-12 20.79H12L0 20.78z" fill="none" stroke="#0f6f7c" stroke-width=".9" opacity=".55"/></pattern>
  <radialGradient id="edgeG" cx=".5" cy=".46" r=".7"><stop offset="0" stop-color="#000"/><stop offset=".42" stop-color="#000"/><stop offset=".78" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></radialGradient>
  <mask id="edgeM"><rect width="1920" height="1080" fill="url(#edgeG)"/></mask>
  <linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="mL" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect x="0" y="0" width="640" height="1080" fill="url(#fadeL)"/></mask>
  <mask id="mR" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect x="1280" y="0" width="640" height="1080" fill="url(#fadeL)" transform="translate(3200 0) scale(-1 1)"/></mask>
  <linearGradient id="waveG" x1="0" x2="1"><stop offset="0" stop-color="#e3c47e"/><stop offset=".5" stop-color="#2fc6dc"/><stop offset="1" stop-color="#e3c47e"/></linearGradient>
  <radialGradient id="nodeG"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#7fe6f2"/><stop offset="1" stop-color="#2fc6dc" stop-opacity="0"/></radialGradient>
  <radialGradient id="nodeGold"><stop offset="0" stop-color="#fff8e0"/><stop offset=".35" stop-color="#ecd08a"/><stop offset="1" stop-color="#c39a3d" stop-opacity="0"/></radialGradient>
</defs>`;
el('rect', { width: 1920, height: 1080, fill: 'url(#hexp)', mask: 'url(#edgeM)', opacity: .55 }, ai);

const circuitPulses = [];
function circuits(side) {
  const g = el('g', { mask: side < 0 ? 'url(#mL)' : 'url(#mR)' }, ai);
  const X = x => side < 0 ? x : 1920 - x;
  for (let i = 0; i < 17; i++) {
    const y0 = 360 + i * 31 + R(-6, 6);
    const x0 = R(18, 70);
    const x1 = x0 + R(60, 170);
    const d = R(18, 52) * (rnd() < .5 ? -1 : 1);
    const x2 = x1 + Math.abs(d);
    const x3 = Math.min(x2 + R(50, 230), 600);
    const pts = [[x0, y0], [x1, y0], [x2, y0 + d], [x3, y0 + d]];
    const dstr = 'M' + pts.map(p => X(p[0]).toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
    const gold = i % 3 !== 1;
    const col = gold ? '#c39a3d' : '#0e8a8c';
    el('path', { d: dstr, fill: 'none', stroke: col, 'stroke-width': 1.6, opacity: .55 }, g);
    el('circle', { cx: X(x3), cy: y0 + d, r: 3.6, fill: '#fff', stroke: col, 'stroke-width': 1.6, opacity: .9 }, g);
    el('circle', { cx: X(x0), cy: y0, r: 2.4, fill: col, opacity: .8 }, g);
    const len = (x1 - x0) + Math.hypot(x2 - x1, d) + (x3 - x2);
    const p = el('path', { d: dstr, fill: 'none', stroke: gold ? '#fff2c6' : '#9ff3ff', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': `26 ${len + 60}`, 'stroke-dashoffset': 26, opacity: .95 }, g);
    circuitPulses.push({ p, len });
  }
  // traces from the hanging ornaments (AI nodes)
  const sx = 137, sy = 257;
  const tr = [[[sx + 30, sy], [sx + 120, sy], [sx + 150, sy + 30], [sx + 300, sy + 30]], [[sx + 22, sy - 22], [sx + 90, sy - 90], [sx + 260, sy - 90]], [[sx + 22, sy + 22], [sx + 70, sy + 70], [sx + 230, sy + 70]]];
  tr.forEach(pts => {
    const dstr = 'M' + pts.map(p => X(p[0]).toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
    el('path', { d: dstr, fill: 'none', stroke: '#c39a3d', 'stroke-width': 1.6, opacity: .7 }, g);
    const e = pts[pts.length - 1];
    el('circle', { cx: X(e[0]), cy: e[1], r: 4, fill: '#fff', stroke: '#c39a3d', 'stroke-width': 1.6 }, g);
    let len = 0; for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    const p = el('path', { d: dstr, fill: 'none', stroke: '#fff2c6', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': `22 ${len + 60}`, 'stroke-dashoffset': 22 }, g);
    circuitPulses.push({ p, len });
  });
}
circuits(-1); circuits(1);

// neural meshes in the upper corners
const neural = [];
function mesh(cx0, cx1, cy0, cy1, n, grad) {
  const g = el('g', {}, ai);
  const nodes = [];
  for (let i = 0; i < n; i++) nodes.push([R(cx0, cx1), R(cy0, cy1), R(0, 6.28), R(.6, 1.6)]);
  nodes.forEach((a, i) => {
    const near = nodes.map((b, j) => [Math.hypot(a[0] - b[0], a[1] - b[1]), j]).filter(v => v[1] !== i).sort((p, q) => p[0] - q[0]).slice(0, 3);
    near.forEach(([dd, j]) => { if (j > i && dd < 190) el('line', { x1: a[0], y1: a[1], x2: nodes[j][0], y2: nodes[j][1], stroke: '#2a8fa0', 'stroke-width': 1, opacity: .28 }, g); });
  });
  nodes.forEach(a => { const c = el('circle', { cx: a[0], cy: a[1], r: 9, fill: `url(#${grad})` }, g); el('circle', { cx: a[0], cy: a[1], r: 2.4, fill: '#fff', opacity: .9 }, g); neural.push({ c, ph: a[2], f: a[3] }); });
}
mesh(200, 560, 120, 330, 13, 'nodeGold');
mesh(1360, 1720, 120, 330, 13, 'nodeG');

// rotating rings around the hanging stars of the theme
const starRings = [];
[[137, 257], [1783, 257]].forEach(([x, y]) => {
  const g = el('g', { transform: `translate(${x} ${y})` }, ai);
  el('circle', { r: 62, fill: 'url(#nodeG)', opacity: .28 }, g);
  const a = el('g', {}, g); el('circle', { r: 50, fill: 'none', stroke: '#c39a3d', 'stroke-width': 1.5, 'stroke-dasharray': '14 7 3 7', opacity: .85 }, a);
  const b = el('g', {}, g); el('circle', { r: 64, fill: 'none', stroke: '#0e8a8c', 'stroke-width': 1.1, 'stroke-dasharray': '2 6', opacity: .8 }, b);
  for (let i = 0; i < 4; i++) { const t = i * Math.PI / 2; el('circle', { cx: Math.cos(t) * 64, cy: Math.sin(t) * 64, r: 3, fill: '#e3c47e' }, b); }
  starRings.push(a, b);
});

// flowing data waves along the bottom
const waves = [];
[[884, 16, 760, '#2fc6dc', .5], [906, 22, 980, '#e3c47e', .55], [930, 13, 640, '#1c62b4', .35]].forEach(([y, A, L, c, o], i) => {
  const g = el('g', {}, ai);
  let d = '';
  for (let x = -1100; x <= 3100; x += 16) d += (x === -1100 ? 'M' : 'L') + x + ' ' + (y + A * Math.sin((x / L) * Math.PI * 2 + i)).toFixed(1);
  el('path', { d, fill: 'none', stroke: c, 'stroke-width': 1.5, opacity: o }, g);
  el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': 2.6, opacity: .9, 'stroke-dasharray': '3 70 1 140', 'stroke-linecap': 'round' }, g);
  waves.push({ g, L });
});

// ---------------------------------------------------------------- particles (canvas, deterministic)
const cv = $('#particles'), cx = cv.getContext('2d');
const sprite = col => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, col); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return c; };
const SPR = [sprite('rgba(236,208,138,.9)'), sprite('rgba(80,214,232,.9)'), sprite('rgba(255,255,255,.9)')];
const parts = [];
for (let i = 0; i < 95; i++) {
  let x = R(0, 1920); if (rnd() < .6) x = rnd() < .5 ? R(0, 520) : R(1400, 1920);
  parts.push({ x, y: R(0, 1180), v: R(6, 22), s: R(5, 15), sw: R(4, 22), f: R(.15, .5), ph: R(0, 6.28), tw: R(.6, 2.2), c: (i % 3), a: R(.35, .9) });
}
function drawParticles(t) {
  cx.clearRect(0, 0, 1920, 1080);
  for (const p of parts) {
    let y = (p.y - p.v * t) % 1180; if (y < 0) y += 1180; y -= 60;
    const x = p.x + p.sw * Math.sin(t * p.f + p.ph);
    const centre = Math.max(0, 1 - Math.abs(x - 960) / 520) * Math.max(0, 1 - Math.abs(y - 500) / 420);
    const a = p.a * (.45 + .55 * Math.sin(t * p.tw + p.ph * 2) ** 2) * (1 - .8 * centre);
    cx.globalAlpha = a; cx.drawImage(SPR[p.c], x - p.s / 2, y - p.s / 2, p.s, p.s);
  }
  cx.globalAlpha = 1;
}

// ---------------------------------------------------------------- scene-specific DOM
// documents (S2)
const docsBox = $('#docs');
const docCols = ['#13806a', '#c39a3d', '#1c62b4', '#0e8a8c'];
const docs = [];
for (let i = 0; i < 9; i++) {
  const w = document.createElement('div'); w.className = 'abs';
  const sx = R(0, 440), sy = R(0, 360), rot = R(-18, 18);
  const gx = (i % 3) * 190 + 22, gy = Math.floor(i / 3) * 186 - 6;
  w.style.cssText = `left:${sx}px;top:${sy}px;width:150px;height:192px`;
  w.innerHTML = `<div class="doc" style="--c:${docCols[i % 4]}"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><span class="ok">${icon('check')}</span></div>`;
  docsBox.appendChild(w);
  docs.push({ w, inner: w.firstChild, sx, sy, rot, gx, gy });
}

// KPI placeholders + viz (S9)
$$('#s9 .kpi.glass').forEach(k => { const ph = document.createElement('div'); ph.className = 'kpi ph'; ph.style.cssText = k.getAttribute('style'); $('#phs').appendChild(ph); });
const vizState = [];
$$('#s9 [data-viz]').forEach(v => {
  const kind = v.dataset.viz;
  if (kind === 'bars2') { // stopwatch dial
    v.innerHTML = `<svg viewBox="-60 -60 120 120" style="position:absolute;left:50%;top:50%;width:104px;height:104px;transform:translate(-50%,-50%)"><circle r="50" fill="#f3f9f9" stroke="#c39a3d" stroke-width="2"/>${[...Array(12)].map((_, i) => { const a = i * 30 * Math.PI / 180; return `<line x1="${Math.cos(a) * 42}" y1="${Math.sin(a) * 42}" x2="${Math.cos(a) * 48}" y2="${Math.sin(a) * 48}" stroke="#5d7d8a" stroke-width="2"/>`; }).join('')}<path class="arc" fill="none" stroke="#2fc6dc" stroke-width="5" stroke-linecap="round"/><line class="hand" x1="0" y1="0" x2="0" y2="-38" stroke="#0b2f3d" stroke-width="3.5" stroke-linecap="round"/><circle r="5" fill="#c39a3d"/></svg>`;
  } else if (kind === 'bars') {
    v.innerHTML = `<div style="position:absolute;left:50%;bottom:6px;transform:translateX(-50%);display:flex;gap:12px;align-items:flex-end;height:96px;direction:ltr">${[...Array(7)].map(() => '<i style="display:block;width:22px;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,#2fc6dc,#13806a)"></i>').join('')}</div>`;
  } else if (kind === 'ring') {
    v.innerHTML = `<svg viewBox="-60 -60 120 120" style="position:absolute;left:50%;top:50%;width:106px;height:106px;transform:translate(-50%,-50%)"><circle r="44" fill="none" stroke="#e1ecee" stroke-width="12"/><circle class="arc" r="44" fill="none" stroke="url(#ringG)" stroke-width="12" stroke-linecap="round" stroke-dasharray="70 207" transform="rotate(-90)"/><defs><linearGradient id="ringG"><stop offset="0" stop-color="#13806a"/><stop offset="1" stop-color="#1c62b4"/></linearGradient></defs><path fill="#c39a3d" d="M0 -14L3 -3 14 0 3 3 0 14 -3 3 -14 0 -3 -3Z"/></svg>`;
  } else if (kind === 'dots') {
    v.innerHTML = `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:14px;direction:ltr">${[...Array(5)].map(() => `<span style="width:46px;height:46px;border-radius:50%;background:#eef6f6;border:2px solid #cfe2e4;display:flex;align-items:center;justify-content:center;color:#5d7d8a">${icon('users').replace('class="ico"', 'class="ico" style="width:26px;height:26px"')}</span>`).join('')}</div>`;
  } else if (kind === 'checks') {
    v.innerHTML = `<div style="position:absolute;left:20px;right:20px;top:4px">${['صلاحيات الوصول', 'حماية البيانات', 'سجلات التدقيق'].map(s => `<div style="display:flex;align-items:center;gap:10px;font:600 17px 'Plex';color:#2f5566;height:36px"><span class="cb" style="width:24px;height:24px;border-radius:7px;border:2px solid #b9d3d6;display:flex;align-items:center;justify-content:center;color:#fff">${icon('check').replace('class="ico"', 'class="ico" style="width:16px;height:16px"')}</span>${s}</div>`).join('')}</div>`;
  }
  vizState.push({ v, kind });
});
function drawViz(t) {
  for (const { v, kind } of vizState) {
    if (kind === 'bars2') {
      const a = (t * 70) % 360, r = a * Math.PI / 180;
      v.querySelector('.hand').setAttribute('transform', `rotate(${a})`);
      const x = Math.sin(r) * 50, y = -Math.cos(r) * 50;
      v.querySelector('.arc').setAttribute('d', `M0 -50A50 50 0 ${a > 180 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`);
    } else if (kind === 'bars') {
      $$('i', v).forEach((b, i) => { b.style.height = (26 + 62 * (.5 + .5 * Math.sin(t * 2.1 + i * .9)) ** 1.3) + 'px'; });
    } else if (kind === 'ring') {
      v.querySelector('.arc').setAttribute('transform', `rotate(${(-90 + t * 120) % 360})`);
    } else if (kind === 'dots') {
      const k = Math.floor(t * 2.2) % 7;
      $$('span', v).forEach((s, i) => { const on = i <= k - 1; s.style.background = on ? 'linear-gradient(135deg,#2fc6dc,#13806a)' : '#eef6f6'; s.style.color = on ? '#fff' : '#5d7d8a'; s.style.borderColor = on ? '#e3c47e' : '#cfe2e4'; });
    } else if (kind === 'checks') {
      const k = Math.floor(t * 1.6) % 5;
      $$('.cb', v).forEach((c, i) => { const on = i < k; c.style.background = on ? '#13806a' : '#fff'; c.style.borderColor = on ? '#13806a' : '#b9d3d6'; });
    }
  }
}

// progress diamonds
const prog = $('#progress');
for (let i = 1; i <= 9; i++) { if (i > 1) { const l = document.createElement('div'); l.className = 'pl'; prog.appendChild(l); } const d = document.createElement('div'); d.className = 'pd'; prog.appendChild(d); }
const pds = $$('.pd', prog);

// centred elements: GSAP owns the transform
$$('#p5,#p7,#p9').forEach(e => { e.style.transform = 'none'; e.style.left = '960px'; gsap.set(e, { xPercent: -50 }); });

// ---------------------------------------------------------------- timeline helpers
const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
const pop = (target, t, o = {}) => tl.fromTo(target,
  { autoAlpha: 0, y: o.y ?? 26, x: o.x ?? 0, scale: o.s ?? .96, filter: o.blur === false ? 'none' : 'blur(6px)' },
  { autoAlpha: 1, y: 0, x: 0, scale: 1, filter: o.blur === false ? 'none' : 'blur(0px)', duration: o.d ?? .6, ease: o.e ?? 'back.out(1.4)', stagger: o.st ?? 0, transformOrigin: o.to ?? '50% 50%' }, t);
const out = (target, t, o = {}) => tl.to(target, { autoAlpha: 0, y: o.y ?? 0, scale: o.s ?? 1, duration: o.d ?? .4, ease: 'power1.in' }, t);
const typer = (target, text, t, dur) => { target.textContent = ''; const p = { n: 0 }; tl.to(p, { n: text.length, duration: dur, ease: 'none', onUpdate: () => { target.textContent = text.slice(0, Math.round(p.n)); } }, t); };
const loop = (target, vars, t0, t1, period) => { const n = Math.max(1, Math.floor((t1 - t0) / period)); tl.to(target, { ...vars, duration: period / 2, ease: 'sine.inOut', yoyo: true, repeat: 2 * n - 1 }, t0); };
const spin = (target, deg, t0 = 0, t1 = TOT, svg = false) => tl.fromTo(target, { rotation: 0 }, { rotation: deg * (t1 - t0) / 60, duration: t1 - t0, ease: 'none', ...(svg ? { svgOrigin: '0 0' } : { transformOrigin: '50% 50%' }) }, t0);
const draw = (path, t, dur, len) => { len = len || path.getTotalLength(); gsap.set(path, { strokeDasharray: len, strokeDashoffset: len }); tl.to(path, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, t); };

const W = {
  s0: [0, TL.titleT], s1: [TL.titleT, K(2) - .35], s2: [K(2) - .35, K(8) - .3], s3: [K(8) - .3, K(13) - .25], s4: [K(13) - .25, K(22) - .3],
  s5: [K(22) - .3, K(29) - .3], s6: [K(29) - .3, KE(33) + .25], s6b: [KE(33) + .25, K(37) - .35], s7: [K(37) - .35, K(43) - .3],
  s8: [K(43) - .3, K(50) - .3], s9: [K(50) - .3, K(58) - .3], s10: [K(58) - .3, K(62) - .3], s11: [K(62) - .3, KE(65) + .6], s12: [KE(65) + .6, TOT + 1],
};
Object.entries(W).forEach(([id, [a, b]]) => {
  const s = '#' + id;
  if (id === 's0') tl.fromTo(s, { autoAlpha: 1 }, { autoAlpha: 1, duration: .01 }, 0);
  else tl.fromTo(s, { autoAlpha: 0, scale: 1.025, filter: 'blur(10px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: .7, ease: 'power2.out' }, a - .2);
  if (id !== 's12') tl.to(s, { autoAlpha: 0, scale: .985, filter: 'blur(8px)', duration: .5, ease: 'power2.in' }, b - .45);
  if (id !== 's0') tl.fromTo('#flash', { autoAlpha: 0, x: -1500 }, { keyframes: [{ autoAlpha: .55, x: -300, duration: .45, ease: 'none' }, { autoAlpha: 0, x: 1500, duration: .55, ease: 'none' }] }, a - .5);
});

// ---------------------------------------------------------------- background motion
tl.fromTo('#bg', { scale: 1.0, x: 0 }, { scale: 1.06, x: -12, duration: TOT, ease: 'none' }, 0);
circuitPulses.forEach(({ p, len }, i) => {
  const per = 2.2 + (i % 5) * .55, gap = 1.5 + (i % 7) * .6, start = (i * .37) % 4;
  const n = Math.ceil((TOT - start) / (per + gap));
  tl.fromTo(p, { strokeDashoffset: 26 }, { strokeDashoffset: -(len + 30), duration: per, ease: 'none', repeat: n, repeatDelay: gap }, start);
});
starRings.forEach((r, i) => spin(r, i % 2 ? -40 : 60, 0, TOT, true));
waves.forEach(({ g, L }, i) => { const per = 9 + i * 3; tl.fromTo(g, { x: 0 }, { x: -L, duration: per, ease: 'none', repeat: Math.ceil(TOT / per) }, 0); });
$$('.core').forEach((c, i) => {
  const r1 = $('.r1', c), r2 = $('.r2', c), r3 = $('.r3', c);
  if (r1) spin(r1, 30, 0, TOT, true);
  if (r2) spin(r2, -55, 0, TOT, true);
  if (r3) spin(r3, 14, 0, TOT, true);
  const g = $('.cglow', c); if (g) loop(g, { opacity: .45 }, 0, TOT, 3.2);
});
$$('[data-ring]').forEach((r, i) => spin(r, i % 2 ? -36 : 48));

// ---------------------------------------------------------------- S0 intro
(function () {
  const svg = $('#introLines');
  const cxm = 960, cym = 330, lines = [];
  for (let side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const y = 214 + i * 29 + (i % 2 ? 6 : 0);
      const xs = cxm + side * (165 + Math.abs(y - cym) * .35);
      const xe = cxm + side * (430 + (i * 53) % 260);
      const jog = (i % 3 === 0) ? 18 * (i % 2 ? 1 : -1) : 0;
      const d = jog ? `M${xs} ${y}H${(xs + xe) / 2}l${side * 18} ${jog}H${xe}` : `M${xs} ${y}H${xe}`;
      const p = el('path', { d, fill: 'none', stroke: i % 3 === 1 ? '#0e8a8c' : '#c39a3d', 'stroke-width': 1.6, opacity: .75 }, svg);
      el('circle', { cx: xe, cy: y + jog, r: 3.4, fill: '#fff', stroke: '#c39a3d', 'stroke-width': 1.5 }, svg);
      lines.push(p);
    }
  }
  lines.forEach((p, i) => draw(p, .2 + (i % 9) * .14, 1.5));
  tl.fromTo('#introLines circle', { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, stagger: .05 }, 1.2);
  tl.fromTo('#medal', { autoAlpha: 0, scale: .45, rotation: -25 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.0, ease: 'back.out(1.5)' }, 2.2);
  tl.fromTo('#medalBurst', { autoAlpha: .95, scale: .85 }, { autoAlpha: 0, scale: 1.95, duration: 1.1, ease: 'power2.out' }, 2.45);
  const IN = TL.intro;
  pop($$('#i1 .w'), IN[0][0] - .05, { st: .16, y: 30 });
  out('#i1', IN[1][0] - .35, { y: -30 });
  pop($$('#i2 .w'), IN[1][0] - .15, { st: .12, y: 30 });
  pop('#i3', IN[2][0] - .1, { s: .92, d: .8, e: 'power3.out' });
  pop('#i4', Math.min(IN[2][1] + .2, TL.titleT - 1.6), { y: 14 });
})();

// ---------------------------------------------------------------- S1 title
const T1 = TL.titleT;
pop('#titleCore', T1 + .05, { s: .5, d: .9 });
pop('#tMk', T1 + .35, { x: 70, y: 0, d: .8, e: 'power3.out' });
pop('#tAi', T1 + .75, { x: -70, y: 0, s: 1.25, d: .8, e: 'power3.out' });
tl.fromTo('#tDiv', { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, duration: .8 }, T1 + 1.4);
pop('#tSub', T1 + 1.7, { y: 20 });
pop($$('#tChips .pill'), K(1) + .3, { st: .4, y: 24 });
loop('#tAi', { scale: 1.05 }, T1 + 2.2, W.s1[1] - .5, 2.2);

// ---------------------------------------------------------------- S2 challenges
(function () {
  const t0 = K(2);
  docs.forEach((d, i) => {
    tl.fromTo(d.w, { autoAlpha: 0, x: 0, y: 40, rotation: d.rot - 20, scale: .7 }, { autoAlpha: 1, y: 0, rotation: d.rot, scale: 1, duration: .7, ease: 'back.out(1.6)' }, t0 + .1 + i * .09);
    loop(d.inner, { y: -10 - (i % 3) * 3 }, t0 + 1.2 + i * .07, K(6) - .2, 2.4 + (i % 4) * .35);
    tl.to(d.w, { x: d.gx - d.sx, y: d.gy - d.sy, rotation: 0, duration: 1.2, ease: 'power3.inOut' }, K(6) + .05 + i * .05);
    pop($('.ok', d.inner), K(6) + 1.6 + i * .08, { s: .3, d: .4, blur: false });
  });
  tl.fromTo('#scanBeam', { autoAlpha: 0, y: -40 }, { keyframes: [{ autoAlpha: 1, y: 60, duration: .3 }, { y: 520, duration: 1.3, ease: 'none' }, { autoAlpha: 0, duration: .3 }] }, K(6) + 1.0);
  pop('#c1', t0 + .5, { x: 50, y: 0 });
  pop('#c2', K(3) + .3, { x: 50, y: 0 });
  pop('#c3', K(4) + .05, { x: 50, y: 0 });
  pop('#c4', K(5) + .1, { x: 50, y: 0 });
  pop('#banner', K(6) + .2, { y: 40, s: .98 });
  tl.set('#bn2', { autoAlpha: 0 }, 0);
  pop('#bn2', K(7) + .1, { x: -50, y: 0 });
})();

// ---------------------------------------------------------------- S3 assistant
(function () {
  pop('#w3', W.s3[0] + .1, { y: 50, s: .97, d: .8, e: 'power3.out' });
  const btnX = 330 + 34 + 140, btnY = 222 + 690 - 30 - 30;
  gsap.set('#cur3', { left: 0, top: 0 });
  tl.fromTo('#cur3', { autoAlpha: 0, x: 1250, y: 760 }, { autoAlpha: 1, duration: .3 }, K(9) + .2);
  tl.to('#cur3', { x: btnX, y: btnY, duration: 1.5, ease: 'power2.inOut' }, K(9) + .4);
  tl.to('#cur3', { scale: .82, duration: .12, yoyo: true, repeat: 1, transformOrigin: '0 0' }, K(9) + 2.05);
  tl.fromTo('#rip3', { left: btnX, top: btnY, autoAlpha: .9, scale: .3 }, { autoAlpha: 0, scale: 1.8, duration: .7 }, K(9) + 2.1);
  tl.to('#cur3', { autoAlpha: 0, duration: .3 }, K(9) + 2.9);
  loop('#askGlow', { opacity: .9 }, K(9), K(9) + 2.2, 1.1);
  tl.set('#askGlow', { opacity: 0 }, K(9) + 2.3);
  pop('#chat3', K(9) + 2.35, { s: .85, y: 30, to: '0% 100%', d: .7 });
  tl.set(['#q3', '#ty3', '#a3', '#perm3'], { autoAlpha: 0 }, 0);
  tl.set('#q3', { autoAlpha: 1 }, K(10) + .05);
  typer($('#q3 .tx'), 'ما آخر إجراء تم في هذه المعاملة؟', K(10) + .1, 1.5);
  tl.set('#ty3', { autoAlpha: 1 }, K(11) - .2);
  tl.set('#ty3', { autoAlpha: 0 }, K(11) + .9);
  pop('#a3', K(11) + .9, { y: 16 });
  tl.fromTo('#w3lastHl', { autoAlpha: 0 }, { autoAlpha: 1, duration: .35, yoyo: true, repeat: 3 }, K(11) + 1.2);
  tl.set('#w3lastHl', { autoAlpha: .8 }, K(11) + 2.7);
  pop('#perm3', K(12) + .1, { y: 16 });
})();

// ---------------------------------------------------------------- S4 how it works
(function () {
  pop('#chat4', W.s4[0] + .15, { x: -50, y: 0, d: .7 });
  tl.set(['#q4', '#a4', '#a4b'], { autoAlpha: 0 }, 0);
  tl.set('#q4', { autoAlpha: 1 }, K(14) + .05);
  typer($('#q4 .tx'), 'لخّص لي هذه المعاملة، واذكر آخر إجراء والمطلوب حاليًا.', K(14) + .1, 2.1);
  pop('#sum4', K(14) + 1.3, { x: 60, y: 0, d: .7 });
  tl.set(['#r1', '#r2', '#r3', '#r4', '#r5'], { autoAlpha: 0 }, 0);
  pop('#a4', K(14) + 2.35, { y: 12 });
  for (let i = 0; i < 4; i++) tl.fromTo('#sumScan', { autoAlpha: 0, y: -40 }, { keyframes: [{ autoAlpha: 1, y: 0, duration: .2 }, { y: 520, duration: 1.4, ease: 'none' }, { autoAlpha: 0, duration: .2 }] }, K(14) + 1.9 + i * 3.1);
  pop('#r1', K(14) + 2.6, { x: 40, y: 0 });
  tl.to('#r1', { boxShadow: '0 0 0 3px rgba(47,198,220,.7), 0 0 24px rgba(47,198,220,.45)', duration: .4, yoyo: true, repeat: 3 }, K(15) + .1);
  pop('#r2', K(16) + .1, { x: 40, y: 0 });
  pop('#r3', K(17) + .1, { x: 40, y: 0 });
  pop('#r4', K(18) + .2, { x: 40, y: 0 });
  pop('#r5', K(19) + .1, { x: 40, y: 0 });
  tl.to('#a4', { autoAlpha: 0, duration: .25 }, K(19) + .35);
  pop('#a4b', K(19) + .5, { y: 10 });
  pop('#p4a', K(20) + .2, { y: 20 });
  pop('#p4b', K(21) + .3, { y: 20 });
  tl.to('#r5 .chip', { boxShadow: '0 0 0 3px rgba(227,196,126,.8)', duration: .35, yoyo: true, repeat: 3, stagger: .15 }, K(21) + .6);
})();

// ---------------------------------------------------------------- S5 uses
(function () {
  const svg = $('#hubLines');
  const hub = [960, 550];
  const cards = [['#u1', 1, 300], ['#u2', 1, 510], ['#u3', 1, 720], ['#u4', -1, 300], ['#u5', -1, 510], ['#u6', -1, 720]];
  const paths = {};
  cards.forEach(([id, dir, cy]) => {
    const ex = dir > 0 ? 1195 : 725, sx = hub[0] + dir * 112, sy = hub[1] + (cy - hub[1]) * .32;
    const d = `M${sx} ${sy}C${sx + dir * 90} ${sy},${ex - dir * 110} ${cy},${ex} ${cy}`;
    const base = el('path', { d, fill: 'none', stroke: '#c39a3d', 'stroke-width': 2, opacity: .75 }, svg);
    const dot = el('circle', { cx: ex, cy, r: 5, fill: '#fff', stroke: '#c39a3d', 'stroke-width': 2 }, svg);
    const len = base.getTotalLength();
    const pulse = el('path', { d, fill: 'none', stroke: '#2fc6dc', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': `30 ${len + 40}`, 'stroke-dashoffset': 30 }, svg);
    paths[id] = { base, dot, pulse, len };
  });
  pop('#hubCore', W.s5[0] + .2, { s: .4, d: .9 });
  pop('#hubLbl', W.s5[0] + .6, { y: 14 });
  const show = (id, t) => {
    const p = paths[id];
    draw(p.base, t, .6, p.len);
    tl.fromTo(p.dot, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2 }, t + .5);
    pop(id, t + .35, { x: id <= '#u3' ? 40 : -40, y: 0 });
    tl.set(p.pulse, { autoAlpha: 0 }, 0); tl.set(p.pulse, { autoAlpha: 1 }, t + .6);
    const n = Math.ceil((W.s5[1] - t) / 1.9);
    tl.fromTo(p.pulse, { strokeDashoffset: 30 }, { strokeDashoffset: -(p.len + 10), duration: 1.1, ease: 'none', repeat: n, repeatDelay: .8 }, t + .6);
  };
  show('#u1', K(22) + .3);
  tl.to('#hubCore', { scale: 1.12, duration: .45, yoyo: true, repeat: 1, ease: 'sine.inOut' }, K(23) + .3);
  show('#u2', K(24) + 1.1);
  show('#u3', K(25) + .1);
  show('#u4', K(25) + 1.2);
  show('#u5', K(26) + .25);
  show('#u6', K(27) + .25);
  tl.fromTo('#hubBound', { autoAlpha: 0, scale: .7 }, { autoAlpha: 1, scale: 1, duration: .8, ease: 'back.out(1.4)' }, K(28) + .2);
  spin('#hubBound', 20, K(28), W.s5[1]);
  pop('#p5', K(28) + .6, { y: 24 });
})();

// ---------------------------------------------------------------- S6 search & drafts
(function () {
  pop('#w6', W.s6[0] + .15, { x: -40, y: 0, d: .7 });
  ['#pr1', '#pr2', '#pr3', '#pr4'].forEach(id => tl.set(id, { autoAlpha: 0 }, 0));
  const prT = [[`#pr1`, K(29) + .2], ['#pr2', K(30) + .1], ['#pr3', K(30) + 1.3], ['#pr4', K(31) + .1]];
  prT.forEach(([id, t]) => { pop(id, t, { x: 40, y: 0 }); const tx = $(id + ' .tx'); typer(tx, tx.textContent, t + .25, 1.1); });
  tl.to('#pr4', { boxShadow: '0 0 0 3px rgba(227,196,126,.9), 0 18px 40px -16px rgba(10,64,84,.45)', duration: .3 }, K(31) + .5);
  for (let i = 0; i < 2; i++) tl.fromTo('#w6scan', { autoAlpha: 0, y: 0 }, { keyframes: [{ autoAlpha: 1, duration: .2 }, { y: 520, duration: 1.2, ease: 'none' }, { autoAlpha: 0, duration: .2 }] }, K(29) + 1.5 + i * 1.6);
  tl.to(['#l1 .hl', '#l2 .hl', '#l3 .hl'], { autoAlpha: 1, duration: .35, stagger: .3 }, K(29) + 2.6);
  tl.to(['#l1 .hl', '#l2 .hl', '#l3 .hl'], { autoAlpha: 0, duration: .3 }, K(30) - .1);
  tl.to(['#l1 .tag', '#l4 .tag'], { scale: 1.15, duration: .3, yoyo: true, repeat: 3 }, K(30) + .5);
  tl.to(['#l1 .hl', '#l4 .hl'], { autoAlpha: .9, duration: .3 }, K(30) + .5);
  tl.to(['#l2 .tag', '#l3 .tag'], { scale: 1.15, duration: .3, yoyo: true, repeat: 3 }, K(30) + 1.8);
  tl.to(['#l2 .hl', '#l3 .hl'], { autoAlpha: .9, duration: .3 }, K(30) + 1.8);
  pop('#draft', K(32) - .1, { y: 140, s: .95, d: .8, e: 'power3.out' });
  tl.set('#s6 .draft .ln', { scaleX: 0 }, 0);
  tl.to('#s6 .draft .ln', { scaleX: 1, duration: .32, stagger: .2, ease: 'power1.inOut' }, K(32) + .6);
  pop('#p6', K(32) + .3, { x: 40, y: 0 });
  tl.fromTo('#stamp', { autoAlpha: 0, scale: 2.2, rotation: -30 }, { autoAlpha: 1, scale: 1, rotation: -12, duration: .38, ease: 'power4.in' }, K(33) + .4);
  tl.to('#draft', { x: 6, duration: .05, yoyo: true, repeat: 5 }, K(33) + .78);
})();

// ---------------------------------------------------------------- S6b smart notifications (new voice)
(function () {
  pop('#desk', W.s6b[0] + .1, { s: .94, y: 30, d: .8, e: 'power3.out' });
  tl.set(['#npanel', '#widget', '#badge'], { autoAlpha: 0 }, 0);
  const CH = TL.chime, dings = [CH, CH + .7, CH + 1.35];
  tl.fromTo('#bellRing', { autoAlpha: 0, scale: .8 }, { autoAlpha: 1, scale: 1.5, duration: .7, repeat: 2, ease: 'power1.out' }, K(34) + 2.2);
  tl.to('#bell', { boxShadow: '0 0 0 3px #f0d58f, 0 0 26px 6px rgba(240,213,143,.7)', duration: .4 }, K(34) + 2.2);
  dings.forEach((d, i) => {
    tl.fromTo('#bellIc', { rotation: 0 }, { keyframes: [{ rotation: 22, duration: .07 }, { rotation: -18, duration: .09 }, { rotation: 12, duration: .08 }, { rotation: 0, duration: .1 }], transformOrigin: '50% 10%' }, d - .02);
    tl.set('#badge', { autoAlpha: 1 }, d - .02);
    tl.fromTo('#badge', { scale: 1.8 }, { scale: 1, duration: .35, ease: 'back.out(2)' }, d - .02);
  });
  pop('#npanel', K(35) - .15, { s: .8, y: 30, to: '0% 100%', d: .6 });
  const slots = { '#n2': 0, '#n3': 110, '#n1': 220 };
  ['#n2', '#n3', '#n1'].forEach((id, i) => { gsap.set(id, { top: slots[id] + 'px' }); pop(id, K(35) + .3 + i * .35, { x: 40, y: 0, d: .45 }); });
  const sortT = TL.sortT;
  tl.fromTo('#sortFx', { autoAlpha: 0 }, { autoAlpha: 1, duration: .25, yoyo: true, repeat: 1 }, sortT - .2);
  tl.to('#n1', { top: '0px', duration: .85, ease: 'power3.inOut' }, sortT);
  tl.to('#n2', { top: '110px', duration: .85, ease: 'power3.inOut' }, sortT);
  tl.to('#n3', { top: '220px', duration: .85, ease: 'power3.inOut' }, sortT);
  tl.to('#n1', { boxShadow: '0 0 0 2px #e04848, 0 0 24px rgba(224,72,72,.35)', duration: .4, yoyo: true, repeat: 3 }, sortT + .9);
  const pinX = 410 + 22 + 140, pinY = 222 + 690 - 78 - 40;
  gsap.set('#cur6', { left: 0, top: 0 });
  tl.fromTo('#cur6', { autoAlpha: 0, x: 1150, y: 560 }, { autoAlpha: 1, duration: .25 }, K(36) - .7);
  tl.to('#cur6', { x: pinX, y: pinY, duration: 1.0, ease: 'power2.inOut' }, K(36) - .55);
  tl.to('#cur6', { scale: .82, duration: .12, yoyo: true, repeat: 1, transformOrigin: '0 0' }, K(36) + .5);
  tl.fromTo('#rip6', { left: pinX, top: pinY, autoAlpha: .9, scale: .3 }, { autoAlpha: 0, scale: 1.7, duration: .6 }, K(36) + .55);
  tl.to('#pinBtn', { backgroundColor: '#fdf3d8', borderColor: '#c39a3d', duration: .2 }, K(36) + .55);
  tl.to('#npanel', { autoAlpha: 0, scale: .55, x: -10, y: -360, duration: .6, ease: 'power3.in', transformOrigin: '0% 0%' }, K(36) + .85);
  tl.to('#cur6', { autoAlpha: 0, duration: .3 }, K(36) + 1.0);
  pop('#widget', K(36) + 1.3, { s: .7, y: 0, to: '0% 0%', d: .7 });
  tl.to('#widget', { boxShadow: '0 24px 50px -16px rgba(0,0,0,.5), 0 0 0 3px rgba(240,213,143,1), 0 0 36px 8px rgba(240,213,143,.55)', duration: .5, yoyo: true, repeat: 3 }, K(36) + 2.1);
})();

// ---------------------------------------------------------------- S7 security
(function () {
  pop('#zone', W.s7[0] + .25, { s: .97, y: 0, d: .7 });
  pop('#zoneLbl', W.s7[0] + .7, { y: 12 });
  pop('#lockG', W.s7[0] + .5, { s: .45, d: .9, e: 'back.out(1.7)' });
  loop('#lockG [data-icon="lockBig"]', { y: -6 }, W.s7[0] + 1.5, W.s7[1], 2.6);
  pop('#appr', K(38) + .3, { x: -30, y: 0 });
  const svg = $('#secLines');
  [['#g1', 348, K(39) + .4], ['#g2', 530, K(39) + 1.9], ['#g3', 712, K(39) + 3.4]].forEach(([id, y, t]) => {
    const d = `M${870 + 95} ${530 + (y - 530) * .4}C1060 ${530 + (y - 530) * .4},1100 ${y},1190 ${y}`;
    const p = el('path', { d, fill: 'none', stroke: '#c39a3d', 'stroke-width': 2, opacity: .8 }, svg);
    draw(p, t - .1, .55);
    pop(id, t + .25, { x: 40, y: 0 });
  });
  tl.set(['#cloud', '#xMark', '#p7'], { autoAlpha: 0 }, 0);
  pop('#cloud', K(40) + .2, { x: -30, y: 0 });
  tl.fromTo('#packet', { autoAlpha: 0, x: 0 }, { keyframes: [{ autoAlpha: 1, duration: .2 }, { x: -228, duration: .9, ease: 'power1.in' }, { x: -200, autoAlpha: 0, duration: .35 }] }, K(40) + 1.3);
  tl.fromTo('#xMark', { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'back.out(2.5)' }, K(40) + 2.35);
  tl.to('#xMark', { x: 6, duration: .05, yoyo: true, repeat: 5 }, K(40) + 2.8);
  tl.to('#zoneRect', { stroke: '#d24d4d', duration: .2, yoyo: true, repeat: 3 }, K(40) + 2.35);
  pop('#p7', K(40) + 2.7, { y: 20 });
  pop('#human', K(41) + .5, { y: 20 });
  tl.to('#human', { boxShadow: '0 0 0 3px rgba(240,213,143,.95), 0 0 34px 8px rgba(240,213,143,.5)', duration: .45, yoyo: true, repeat: 3 }, K(42) + .1);
})();

// ---------------------------------------------------------------- S8 plan
(function () {
  const L = 1140; const f = $('#trackFill');
  gsap.set(f, { strokeDasharray: L, strokeDashoffset: L });
  pop(['#nd1', '#nd2', '#nd3', '#nd4'], W.s8[0] + .3, { s: .5, st: .12, y: 0 });
  const go = (off, t) => tl.to(f, { strokeDashoffset: off, duration: .9, ease: 'power2.inOut' }, t);
  const act = (n, t) => { tl.to(`#nd${n} .fill`, { autoAlpha: 1, duration: .4 }, t + .5); tl.to(`#nd${n} span`, { color: '#fff', duration: .3 }, t + .5); tl.fromTo(`#nd${n}`, { scale: 1 }, { scale: 1.18, duration: .3, yoyo: true, repeat: 1 }, t + .5); pop(`#st${n}`, t + .6, { y: n % 2 ? -26 : 26 }); };
  go(1060, K(44) - .3); act(1, K(44) - .3);
  go(720, K(45) - .2); act(2, K(45) - .2);
  go(390, K(46) - .2); act(3, K(46) - .2);
  go(60, K(47) - .2); act(4, K(47) - .2);
  pop(['#ev1', '#ev2', '#ev3'], K(48) + .1, { st: .45, y: 22 });
  pop('#evArr', K(49) + .1, { x: 20, y: 0 });
  pop('#ev4', K(49) + .3, { x: -30, y: 0 });
  go(0, K(49) + .1);
})();

// ---------------------------------------------------------------- S9 KPIs
(function () {
  pop($$('#phs .kpi'), K(50) + .2, { st: .12, s: .9, y: 0, blur: false });
  ['#k1', '#k2', '#k3', '#k4', '#k5'].forEach((id, i) => pop(id, K(51 + i) + .15, { s: .88, y: 20, d: .6 }));
  tl.set('#p9b', { maxWidth: 0, overflow: 'hidden', display: 'inline-block', whiteSpace: 'nowrap', verticalAlign: 'bottom' }, 0);
  pop('#p9', K(56) + .2, { y: 26 });
  tl.to('#p9b', { maxWidth: 620, duration: .9, ease: 'power2.inOut' }, K(57) + .05);
  tl.to(['#k1', '#k2', '#k3', '#k4', '#k5'], { opacity: .85, duration: .5 }, K(56));
})();

// ---------------------------------------------------------------- S10 closing
(function () {
  pop('#qa', W.s10[0] + .3, { s: .9, y: 20 });
  tl.to('#qa', { scale: .2, autoAlpha: 0, duration: .55, ease: 'power3.in' }, K(58) + 2.6);
  tl.set('#clCore', { autoAlpha: 0 }, 0);
  pop('#clCore', K(58) + 2.9, { s: .3, d: .9, e: 'back.out(1.6)' });
  const svg = $('#clLines');
  [['#cn1', 'M1080 500C1160 500,1200 390,1270 390', K(59) + .3], ['#cn2', 'M840 500C760 500,720 390,650 390', K(60) + .1], ['#cn3', 'M960 660L960 735', K(61) + .1]].forEach(([id, d, t]) => {
    const p = el('path', { d, fill: 'none', stroke: '#c39a3d', 'stroke-width': 2.5, opacity: .85 }, svg);
    draw(p, t, .5);
    pop(id, t + .3, { s: .85, y: 16 });
  });
})();

// ---------------------------------------------------------------- S11 final
(function () {
  pop('#fCore', W.s11[0] + .2, { s: .5, d: .8 });
  pop('#fMain', W.s11[0] + .4, { s: .9, y: 0, d: .8, e: 'power3.out' });
  pop('#fSub', W.s11[0] + 1.0, { y: 20 });
  pop('#fAsk', K(62) + .9, { y: 30, s: .95, d: .7 });
  tl.set(['#fs1', '#fs2', '#fs3', '#fs4', '#fa1', '#fa2', '#fa3'], { autoAlpha: 0 }, 0);
  pop('#fs1', K(62) + 1.6, { y: 20 });
  pop(['#fa1', '#fs2'], K(63) + .1, { y: 20, st: .2 });
  pop(['#fa2', '#fs3'], K(64) + .1, { y: 20, st: .2 });
  pop(['#fa3', '#fs4'], K(65) + .4, { y: 20, st: .2 });
  tl.to('#fs4', { boxShadow: '0 0 0 3px rgba(240,213,143,.95), 0 0 34px 8px rgba(240,213,143,.5)', duration: .5, yoyo: true, repeat: 3 }, K(65) + 1.2);
})();

// ---------------------------------------------------------------- S12 credits
(function () {
  const t0 = W.s12[0];
  pop('#crMedal', t0 + .25, { s: .5, d: .9, e: 'back.out(1.6)' });
  pop('#cr1', t0 + .8, { y: 20 });
  pop('#cr2', t0 + 1.25, { y: 20 });
  pop('#cr3', t0 + 1.7, { s: .9, y: 10, d: .9, e: 'power3.out' });
  pop('#cr4', t0 + 2.5, { y: 14 });
  tl.to(['#brand', '#progress'], { autoAlpha: 0, duration: .5 }, t0 - .3);
  tl.fromTo('#veil', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.0, ease: 'power1.in' }, TOT - 1.0);
})();

tl.fromTo(['#brand', '#progress'], { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: .6 }, TL.titleT + .2);

// ---------------------------------------------------------------- per-frame dynamic state
const cap = $('#cap');
const capSubs = SUBS.map(s => ({ ...s }));
for (let i = 0; i < capSubs.length - 1; i++) if (capSubs[i + 1].start - capSubs[i].end < .4) capSubs[i].end = capSubs[i + 1].start;
let capCur = -2;
function caption(t) {
  let idx = -1;
  for (let i = 0; i < capSubs.length; i++) if (t >= capSubs[i].start - .05 && t < capSubs[i].end + .05) { idx = i; break; }
  if (idx !== capCur) {
    capCur = idx;
    if (idx >= 0) cap.innerHTML = capSubs[idx].text.replace(/AI/g, '<span class="ai">AI</span>');
  }
  if (idx < 0) { cap.style.opacity = 0; return; }
  const s = capSubs[idx];
  const prevJoined = idx > 0 && Math.abs(capSubs[idx - 1].end - s.start) < .01;
  const nextJoined = idx < capSubs.length - 1 && Math.abs(capSubs[idx + 1].start - s.end) < .01;
  let o = 1, dy = 0;
  if (!prevJoined) { const k = Math.min(1, (t - s.start + .05) / .22); o = Math.min(o, k); dy = (1 - k) * 14; }
  if (!nextJoined) o = Math.min(o, Math.max(0, (s.end + .05 - t) / .22));
  cap.style.opacity = o.toFixed(3);
  cap.style.transform = `translateX(-50%) translateY(${dy.toFixed(1)}px)`;
}
const SECT = [['s1', 1], ['s2', 2], ['s3', 3], ['s4', 4], ['s5', 5], ['s6', 6], ['s6b', 6], ['s7', 7], ['s8', 8], ['s9', 9], ['s10', 10], ['s11', 10], ['s12', 10]];
let progCur = -1;
function progress(t) {
  let cur = 0;
  for (const [id, n] of SECT) if (t >= W[id][0] - .2) cur = n;
  if (cur === progCur) return; progCur = cur;
  pds.forEach((d, i) => { d.className = 'pd' + (i + 1 === cur ? ' on' : (i + 1 < cur ? ' done' : '')); });
}
function dyn(t) {
  drawParticles(t);
  caption(t);
  progress(t);
  neural.forEach(n => { n.c.setAttribute('opacity', (.35 + .65 * Math.sin(t * n.f + n.ph) ** 2).toFixed(3)); });
  $$('.typing i').forEach((d, i) => { d.style.opacity = (.3 + .7 * Math.max(0, Math.sin(t * 6 - i * .9))).toFixed(2); });
  if (t > W.s9[0] - 1 && t < W.s9[1] + 1) drawViz(t);
  const live = $('#widget .live i'); if (live) live.style.opacity = (.4 + .6 * Math.abs(Math.sin(t * 3))).toFixed(2);
  const badge = $('#badge'); const CH = TL.chime; badge.textContent = t < CH + .68 ? '1' : (t < CH + 1.33 ? '2' : '3');
}

window.seek = function (t) { tl.seek(Math.min(t, TOT), false); dyn(t); };
window.TOTAL = TOT;
document.fonts.ready.then(() => { window.seek(0); window.READY = true; });
})();
