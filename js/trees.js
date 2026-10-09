/* ════════════════════════════════════════════════════════════════════
   TREES — árboles retorcidos al estilo Tim Burton (con ramas en espiral)
   ════════════════════════════════════════════════════════════════════ */
function buildTree(g, { x, y, len, width, depth, seed, lean }) {
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646);
  const out = [];
  const f = n => n.toFixed(1);
  function curl(x, y, a, size, w) {
    const dir = r() < .5 ? -1 : 1; let d = `M${f(x)} ${f(y)}`, ang = a, rr = size;
    for (let i = 0; i < 16; i++) { ang += dir * .5; rr *= .87; x += Math.cos(ang) * rr * .35; y += Math.sin(ang) * rr * .35; d += ` L${f(x)} ${f(y)}`; }
    out.push(`<path d="${d}" stroke-width="${Math.max(w, .7).toFixed(2)}"/>`);
  }
  function branch(x, y, a, len, w, d) {
    const bend = (r() - .5) * .85 + lean * .1, a2 = a + bend;
    const ex = x + Math.cos(a2) * len, ey = y + Math.sin(a2) * len;
    const mx = x + Math.cos(a + bend * .2) * len * .55 + (r() - .5) * len * .3, my = y + Math.sin(a + bend * .2) * len * .55;
    out.push(`<path d="M${f(x)} ${f(y)} Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}" stroke-width="${w.toFixed(2)}"/>`);
    if (d === 0) { curl(ex, ey, a2, len * .45, w * .85); return; }
    const n = d > 5 ? 2 : (r() < .35 ? 3 : 2);
    for (let i = 0; i < n; i++) {
      const spread = (i - (n - 1) / 2) * (.55 + r() * .4) + (r() - .5) * .3;
      branch(ex, ey, a2 + spread, len * (.66 + r() * .14), w * .66, d - 1);
    }
  }
  out.push(`<path d="M${x - width * 1.8} ${y} Q${x - width * .3} ${y - len * .3} ${x} ${y - len * .5} Q${x + width * .3} ${y - len * .3} ${x + width * 1.8} ${y}Z" fill="currentColor" stroke="none"/>`);
  branch(x, y, -Math.PI / 2 + lean * .12, len, width, depth);
  g.innerHTML = out.join('');
}
function initTrees() {
  const spots = [
    ['#treeL', { x: 230, y: 905, len: 250, width: 28, depth: 7, seed: 7, lean: .7 }],
    ['#treeR', { x: 370, y: 905, len: 240, width: 26, depth: 7, seed: 41, lean: -.7 }],
    ['#moonTree', { x: 58, y: 330, len: 46, width: 5, depth: 5, seed: 12, lean: .5 }],
  ];
  spots.forEach(([sel, opts]) => { const g = $(sel); if (g) buildTree(g, opts); });
}
