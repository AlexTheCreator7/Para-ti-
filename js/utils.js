/* ───────────── utilidades ───────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const TAU = Math.PI * 2;
const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const MOBILE  = matchMedia('(max-width: 700px)').matches;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HAS_GSAP = !!window.gsap;
const DECK = { pos: 0 };   // posición actual del deslizamiento (0 = portada)

/* ───────────── mariposa SVG reutilizable ───────────── */
const PALETTES = {
  blue:   ['#eaf8ff', '#7fd0ff', '#2a74e8', '#0a2a6b'],
  violet: ['#f3ecff', '#c2a9ff', '#7350e0', '#2a1666'],
  rose:   ['#ffe8ef', '#ff97b8', '#e0306a', '#5c0b2a'],
};
let bfUid = 0;
function butterflySVG(kind = 'blue') {
  const P = PALETTES[kind] || PALETTES.blue, id = 'bfg' + bfUid++;
  const wing = (s) => `
    <path d="M${-2*s} -2 C${-14*s} -32 ${-44*s} -40 ${-47*s} -19 C${-48*s} -6 ${-30*s} 2 ${-2*s} 2Z"/>
    <path d="M${-2*s} 2 C${-24*s} 4 ${-40*s} 18 ${-31*s} 31 C${-23*s} 39 ${-8*s} 25 ${-2*s} 6Z"/>
    <g fill="none" stroke="${P[3]}" stroke-opacity=".55" stroke-width=".8">
      <path d="M${-3*s} -1 C${-16*s} -14 ${-30*s} -24 ${-42*s} -22"/><path d="M${-3*s} 0 C${-18*s} -6 ${-32*s} -8 ${-44*s} -10"/><path d="M${-3*s} 3 C${-14*s} 10 ${-22*s} 18 ${-28*s} 27"/>
    </g>
    <g fill="#fff" fill-opacity=".8"><circle cx="${-40*s}" cy="-21" r="1.6"/><circle cx="${-44*s}" cy="-14" r="1.2"/><circle cx="${-29*s}" cy="28" r="1.1"/></g>`;
  return `<svg class="bf" viewBox="-50 -42 100 84" aria-hidden="true">
    <defs><radialGradient id="${id}" cx="0" cy="0" r="50" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${P[0]}"/><stop offset=".3" stop-color="${P[1]}"/><stop offset=".72" stop-color="${P[2]}"/><stop offset="1" stop-color="${P[3]}"/>
    </radialGradient></defs>
    <g class="wl" fill="url(#${id})">${wing(1)}</g>
    <g class="wr" fill="url(#${id})">${wing(-1)}</g>
    <ellipse cx="0" cy="2" rx="2.3" ry="13" fill="#0b1330"/>
    <path d="M-1 -10 Q-6 -24 -12 -29 M1 -10 Q6 -24 12 -29" stroke="#0b1330" stroke-width="1.2" fill="none"/>
  </svg>`;
}
$$('[data-bf]').forEach(el => { el.innerHTML = butterflySVG(el.dataset.bf); });

/* ───────────── divide texto en letras (para escribir de izquierda a derecha) ───────────── */
function splitText(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', words.join(' '));
  el.innerHTML = words.map(w => `<span class="word" aria-hidden="true">${[...w].map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');
  return $$('.ch', el);
}
