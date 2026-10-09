/* ════════════════════════════════════════════════════════════════════
   INTERACCIONES
   ════════════════════════════════════════════════════════════════════ */
function initCards(sky) {
  $$('.card').forEach(card => card.addEventListener('click', () => {
    card.classList.toggle('flipped');
    if (card.classList.contains('flipped')) { const r = card.getBoundingClientRect(); sky.sparks(r.left + r.width / 2, r.top + r.height / 2, 22, ['rose', 'violet', 'white', 'gold']); }
  }));
}

function initLetter(sky) {
  const env = $('#envelope'), letter = $('#letter');
  env.addEventListener('click', () => {
    if (env.dataset.open) return; env.dataset.open = '1';
    const r = env.getBoundingClientRect();
    sky.burst(r.left + r.width / 2, r.top + r.height * .55, MOBILE ? 8 : 14, ['blue', 'violet']);
    if (!HAS_GSAP) { env.hidden = true; letter.hidden = false; return; }
    gsap.timeline()
      .to('#seal', { scale: 1.35, duration: .25, transformOrigin: '50% 50%' })
      .to('#seal', { scale: 0, opacity: 0, duration: .35, ease: 'back.in(2)' })
      .to('#flap', { scaleY: -1, duration: .8, ease: 'power2.inOut', transformOrigin: '50% 0%' }, '-=.1')
      .to(env, { y: 70, opacity: 0, duration: .6, ease: 'power2.in' }, '+=.15')
      .add(() => { env.hidden = true; letter.hidden = false; })
      .from(letter, { opacity: 0, scale: .85, y: 40, duration: 1.1, ease: 'expo.out' })
      .from([...letter.children].filter(el => !el.classList.contains('letter-bf')), { x: i => (i % 2 ? 50 : -50), opacity: 0, filter: 'blur(6px)', stagger: .32, duration: 1, ease: 'power3.out', clearProps: 'filter' }, '-=.7');
  });
}

function initCounter() {
  const start = new Date(2026, 2, 9, 0, 0, 0).getTime(), C = 2 * Math.PI * 45;
  const units = [['days', 365], ['hours', 24], ['mins', 60], ['secs', 60]].map(([k, max]) => {
    const el = $(`[data-u="${k}"]`), ring = $('.prog', el);
    ring.style.strokeDasharray = C;
    return { k, max, val: $('.val', el), ring, last: -1 };
  });
  const beats = $('#beats'), fmt = new Intl.NumberFormat('es');
  const tick = () => {
    const s = Math.max(0, Date.now() - start) / 1000;
    const v = { days: Math.floor(s / 86400), hours: Math.floor(s % 86400 / 3600), mins: Math.floor(s % 3600 / 60), secs: Math.floor(s % 60) };
    units.forEach(u => {
      const x = v[u.k]; if (x === u.last) return;
      u.val.textContent = String(x).padStart(u.k === 'days' ? 3 : 2, '0');
      u.ring.style.strokeDashoffset = C * (1 - (u.k === 'days' ? x % 365 : x) / u.max);
      if (u.last >= 0 && HAS_GSAP) gsap.fromTo(u.val, { y: -12, opacity: .2 }, { y: 0, opacity: 1, duration: .45, ease: 'power2.out' });
      u.last = x;
    });
    beats.textContent = fmt.format(Math.floor(s * 72 / 60));
  };
  tick(); setInterval(tick, 1000);
}

function initSpirits(sky) {
  const modal = $('#modal'), msg = $('#modalMsg'), count = $('#orbCount'), seen = new Set();
  const close = () => {
    if (modal.hidden) return;
    if (HAS_GSAP) gsap.to('.modal-card', { scale: .85, opacity: 0, duration: .25, onComplete: () => { modal.hidden = true; gsap.set('.modal-card', { clearProps: 'all' }); } });
    else modal.hidden = true;
  };
  $$('.orb').forEach((orb, i) => orb.addEventListener('click', () => {
    seen.add(i); orb.classList.add('seen'); count.textContent = seen.size;
    const r = orb.getBoundingClientRect(); sky.sparks(r.left + r.width / 2, r.top + r.height / 2, 26, ['blue', 'white', 'violet']);
    msg.textContent = orb.dataset.msg; const chars = splitText(msg);
    modal.hidden = false;
    if (HAS_GSAP) {
      gsap.from('.modal-card', { scale: .7, opacity: 0, duration: .6, ease: 'back.out(1.6)' });
      gsap.from(chars, { opacity: 0, x: -8, duration: .3, stagger: .022, delay: .25 });
    }
    if (seen.size === 12) setTimeout(() => sky.burst(innerWidth / 2, innerHeight / 2, 30), 500);
  }));
  $('#modalClose').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

function initFinale(sky, heart) {
  const stage = $('#heartStage'), btn = $('#releaseBtn');
  const center = () => { const r = stage.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  stage.addEventListener('click', () => { heart?.burst(); const [x, y] = center(); sky.burst(x, y, MOBILE ? 12 : 20); });
  btn.addEventListener('click', () => {
    heart?.burst(); const [x, y] = center();
    sky.burst(x, y, MOBILE ? 30 : 55);
    setTimeout(() => sky.burst(x - 80, y + 20, MOBILE ? 10 : 20, ['blue', 'violet']), 500);
    setTimeout(() => sky.burst(x + 80, y + 20, MOBILE ? 10 : 20, ['rose', 'violet']), 900);
    btn.textContent = 'Otra vez ♥';
  });
}

/* la canción: "Half Moon — The Piano Duet" (archivo en audio/) */
function createSong(fallback) {
  const audio = new Audio('audio/half-moon.mp3');
  audio.loop = true; audio.preload = 'auto'; audio.volume = 0;
  let playing = false, failed = false, fade = null;
  const ramp = (to, ms, done) => {
    clearInterval(fade); const from = audio.volume, t0 = performance.now();
    fade = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); audio.volume = from + (to - from) * k; if (k === 1) { clearInterval(fade); done?.(); } }, 40);
  };
  audio.addEventListener('error', () => { failed = true; if (playing) fallback.start(); });
  return {
    get playing() { return playing; },
    start() {
      playing = true;
      if (failed) return fallback.start();
      audio.play().then(() => ramp(.85, 2500)).catch(() => { failed = true; fallback.start(); });
    },
    stop() {
      playing = false;
      if (failed) return fallback.stop();
      ramp(0, 700, () => { if (!playing) audio.pause(); });
    },
  };
}

function initLetterVideo(music, sync) {
  const v = $('#letterVideo'), missing = $('#videoMissing');
  let resume = false;
  const check = () => { if (v.error || v.networkState === 3) { v.hidden = true; missing.hidden = false; } };
  v.addEventListener('error', check); check();          // el error pudo ocurrir antes de cargar este código
  $('#envelope').addEventListener('click', () => setTimeout(check, 1500));
  v.addEventListener('play', () => { resume = music.playing; if (resume) { music.stop(); sync(); } });
  const back = () => { if (resume && !music.playing) { music.start(); sync(); } resume = false; };
  v.addEventListener('pause', back); v.addEventListener('ended', back);
  return { pause: () => { if (!v.paused) v.pause(); } };
}

function initMusic(piano) {
  const btn = $('#musicBtn');
  const sync = () => { btn.classList.toggle('on', piano.playing); btn.setAttribute('aria-pressed', piano.playing); };
  btn.addEventListener('click', () => { piano.playing ? piano.stop() : piano.start(); sync(); });
  return sync;
}
