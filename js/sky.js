/* ════════════════════════════════════════════════════════════════════
   SKY — mariposas que dejan rastro, luciérnagas, pétalos y chispas
   ════════════════════════════════════════════════════════════════════ */
function initSky() {
  const c = $('#sky'), ctx = c.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  let W = 0, H = 0;
  const resize = () => { W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);

  const sprite = rgb => {
    const s = document.createElement('canvas'); s.width = s.height = 64;
    const g = s.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.22, `rgba(${rgb},.55)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s;
  };
  const GLOW = { blue: sprite('124,200,255'), violet: sprite('185,160,255'), rose: sprite('255,110,155'), gold: sprite('255,214,140'), white: sprite('235,245,255') };
  const HUE  = { blue: 205, violet: 262, rose: 342 };

  const bfs = [], flies = [], dust = [], sparks = [], petals = [];

  class Butterfly {
    constructor(o = {}) {
      this.kind = o.kind || (Math.random() < .7 ? 'blue' : 'violet');
      this.hue = HUE[this.kind] + rand(-8, 8);
      this.x = o.x ?? rand(-W * .2, W); this.y = o.y ?? rand(H * .1, H * .9);
      this.s = o.s || rand(9, 14) * (MOBILE ? .85 : 1);
      this.h = o.h ?? rand(-.4, .4); this.v = o.v || rand(45, 80);
      this.ph = rand(0, TAU); this.flap = rand(9, 13);
      this.burst = !!o.burst; this.life = o.life || Infinity; this.age = 0; this.alpha = 1;
      this.trail = []; this.max = this.burst ? 24 : 40;
    }
    update(dt, t) {
      this.age += dt;
      if (this.burst) {
        this.v = Math.max(55, this.v * (1 - 1.5 * dt));
        if (this.age > .7) { const tgt = -Math.PI / 2 + Math.sin(t * .8 + this.ph) * .9; this.h += angleDiff(tgt, this.h) * Math.min(1, dt * 1.3); }
        this.alpha = Math.max(0, Math.min(1, (this.life - this.age) / 1.2));
      } else {
        // vuelo natural, siempre de izquierda a derecha
        const tgt = Math.sin(t * .35 + this.ph) * .75 + Math.sin(t * 1.3 + this.ph * 2) * .25;
        this.h += angleDiff(tgt, this.h) * Math.min(1, dt * 1.5);
      }
      this.x += Math.cos(this.h) * this.v * dt;
      this.y += Math.sin(this.h) * this.v * dt + Math.sin(t * 3 + this.ph) * 14 * dt;
      if (!this.burst) {
        if (this.x > W + 80) { this.x = -80; this.y = rand(H * .1, H * .9); this.trail.length = 0; }
        if (this.y < -80) this.y = H + 60; else if (this.y > H + 80) this.y = -60;
      }
      this.trail.push(this.x, this.y);
      if (this.trail.length > this.max * 2) this.trail.splice(0, 2);
      if (Math.random() < .2) dust.push({ x: this.x + rand(-3, 3), y: this.y + rand(-3, 3), vx: rand(-8, 8), vy: rand(6, 24), life: 1, k: this.kind, s: rand(4, 10) });
      return this.age < this.life;
    }
    draw(t) {
      const tr = this.trail, n = tr.length / 2;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      // estela: cinta suave + polvo de estrellas brillante
      for (let i = 1; i < n; i++) {
        const k = i / n;
        ctx.strokeStyle = `hsla(${this.hue},90%,${58 + k * 16}%,${k * .13 * this.alpha})`;
        ctx.lineWidth = k * this.s * .9;
        ctx.beginPath(); ctx.moveTo(tr[i * 2 - 2], tr[i * 2 - 1]); ctx.lineTo(tr[i * 2], tr[i * 2 + 1]); ctx.stroke();
      }
      for (let i = 0; i < n; i += 3) {
        const k = i / n, tw = .5 + .5 * Math.sin(t * 9 + i * 1.7 + this.ph);
        const z = (3 + k * this.s * 1.2) * (.6 + tw * .6);
        ctx.globalAlpha = k * tw * .5 * this.alpha;
        ctx.drawImage(GLOW[i % 2 ? 'white' : this.kind], tr[i * 2] - z / 2 + Math.sin(i) * 3, tr[i * 2 + 1] - z / 2 + Math.cos(i) * 3, z, z);
      }
      ctx.globalAlpha = 1;
      const gs = this.s * 6;
      ctx.globalAlpha = .3 * this.alpha;
      ctx.drawImage(GLOW[this.kind], this.x - gs / 2, this.y - gs / 2, gs, gs);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

      const f = .22 + .78 * Math.abs(Math.sin(t * this.flap + this.ph)), s = this.s;
      ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.h + Math.PI / 2); ctx.globalAlpha = this.alpha;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.7);
      g.addColorStop(0, `hsl(${this.hue},100%,90%)`); g.addColorStop(.45, `hsl(${this.hue},95%,64%)`); g.addColorStop(1, `hsl(${this.hue},90%,30%)`);
      ctx.fillStyle = g;
      for (const side of [-1, 1]) {
        ctx.save(); ctx.scale(side * f, 1); ctx.beginPath();
        ctx.moveTo(0, -1);
        ctx.bezierCurveTo(s * .3, -s * 1.3, s * 1.65, -s * 1.35, s * 1.55, -s * .35);
        ctx.bezierCurveTo(s * 1.45, s * .15, s * .6, s * .2, 0, s * .15);
        ctx.moveTo(0, s * .1);
        ctx.bezierCurveTo(s * .85, s * .15, s * 1.25, s * .85, s * .85, s * 1.15);
        ctx.bezierCurveTo(s * .45, s * 1.35, s * .12, s * .7, 0, s * .35);
        ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = '#0b1330'; ctx.beginPath(); ctx.ellipse(0, s * .2, s * .1, s * .62, 0, 0, TAU); ctx.fill();
      ctx.restore(); ctx.globalAlpha = 1;
    }
  }

  const AMBIENT = REDUCED ? 2 : (MOBILE ? 5 : 8);
  for (let i = 0; i < AMBIENT; i++) bfs.push(new Butterfly());
  const FLIES = REDUCED ? 12 : (MOBILE ? 30 : 60);
  for (let i = 0; i < FLIES; i++) flies.push({ x: rand(0, W), y: rand(0, H), vx: rand(-10, 10), vy: rand(-16, -3), ph: rand(0, TAU), sp: rand(1, 2.6), s: rand(10, 26), k: pick(['blue', 'blue', 'blue', 'white', 'violet', 'gold']) });
  for (let i = 0; i < (MOBILE ? 8 : 14); i++) petals.push({ x: rand(0, W), y: rand(-H, H), vy: rand(14, 32), rot: rand(0, TAU), vr: rand(-1.5, 1.5), sw: rand(0, TAU), s: rand(4, 8) });

  function spark(x, y, k = 'blue', spd = 120) {
    const a = rand(0, TAU), v = rand(spd * .3, spd);
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: rand(.6, 1.3), s: rand(6, 16), k });
  }
  let lastP = 0;
  addEventListener('pointermove', e => {
    const now = performance.now(); if (now - lastP < 30) return; lastP = now;
    sparks.push({ x: e.clientX, y: e.clientY, vx: rand(-20, 20), vy: rand(-30, 10), life: 1, decay: rand(1, 1.8), s: rand(8, 16), k: pick(['blue', 'violet', 'white']) });
  }, { passive: true });
  addEventListener('pointerdown', e => { for (let i = 0; i < 12; i++) spark(e.clientX, e.clientY, pick(['blue', 'violet', 'white']), 140); }, { passive: true });

  let last = performance.now();
  (function frame(now) {
    const dt = Math.min((now - last) / 1000, .05); last = now; const t = now / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const f of flies) {
      f.x += (f.vx + Math.sin(t + f.ph) * 10) * dt; f.y += f.vy * dt;
      if (f.y < -30) { f.y = H + 30; f.x = rand(0, W); }
      if (f.x < -30) f.x = W + 30; else if (f.x > W + 30) f.x = -30;
      const a = .2 + .8 * Math.pow(Math.max(0, Math.sin(t * f.sp + f.ph)), 2);
      ctx.globalAlpha = a; ctx.drawImage(GLOW[f.k], f.x - f.s / 2, f.y - f.s / 2, f.s, f.s);
    }
    for (let i = dust.length - 1; i >= 0; i--) {
      const d = dust[i]; d.life -= dt * .9; if (d.life <= 0) { dust.splice(i, 1); continue; }
      d.x += d.vx * dt; d.y += d.vy * dt;
      ctx.globalAlpha = d.life * .8; const s = d.s * d.life; ctx.drawImage(GLOW[d.k], d.x - s / 2, d.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    for (const p of petals) {
      p.y += p.vy * dt; p.sw += dt; p.rot += p.vr * dt; p.x += Math.sin(p.sw) * 18 * dt;
      if (p.y > H + 20) { p.y = -20; p.x = rand(0, W); }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.sin(p.sw * 1.3)) * .7 + .3);
      ctx.fillStyle = 'rgba(205,225,255,.5)'; ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    for (let i = bfs.length - 1; i >= 0; i--) { if (!bfs[i].update(dt, t)) { bfs.splice(i, 1); continue; } bfs[i].draw(t); }
    ctx.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.life -= dt * s.decay; if (s.life <= 0) { sparks.splice(i, 1); continue; }
      s.vx *= 1 - 2 * dt; s.vy = s.vy * (1 - 2 * dt) + 20 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      const z = s.s * (.4 + s.life); ctx.globalAlpha = s.life; ctx.drawImage(GLOW[s.k], s.x - z / 2, s.y - z / 2, z, z);
      ctx.fillStyle = '#fff'; ctx.fillRect(s.x - .75, s.y - .75, 1.5, 1.5);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  })(last);

  return {
    /* explosión de mariposas que salen volando y suben con su estela */
    burst(x, y, n = 20, kinds = ['blue', 'violet', 'rose']) {
      const room = Math.max(0, 140 - bfs.length); n = Math.min(n, room);
      for (let i = 0; i < n; i++) bfs.push(new Butterfly({ x, y, h: rand(0, TAU), v: rand(180, 440), burst: true, life: rand(2.8, 5), kind: pick(kinds), s: rand(9, 15) }));
      for (let i = 0; i < n * 2; i++) spark(x, y, pick(['white', 'rose', 'blue', 'gold']), 360);
    },
    sparks(x, y, n = 20, kinds = ['blue', 'violet', 'white']) { for (let i = 0; i < n; i++) spark(x, y, pick(kinds), 220); },
  };
}
