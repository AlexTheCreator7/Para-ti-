/* ════════════════════════════════════════════════════════════════════
   ESCENAS — todo lo que entra de izquierda y derecha
   ════════════════════════════════════════════════════════════════════ */
function heroIntro(sky) {
  if (!HAS_GSAP) return;
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.moon-wrap', { scale: .6, opacity: 0, filter: 'blur(14px)', duration: 2.8, clearProps: 'filter' })
    .from('.art img', { x: -40, duration: 3, ease: 'power2.out' }, 0)
    .from('.ground', { y: 140, duration: 1.8 }, .3)
    .fromTo('.hero-title', { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0% -20% 0)', duration: 2.4, ease: 'power2.inOut', clearProps: 'clipPath' }, 1.1)
    .from('.hero-sub', { x: 80, opacity: 0, duration: 1.6 }, 1.8)
    .from('.scroll-cue', { opacity: 0, duration: 1 }, 2.6)
    .call(() => {
      const r = $('.moon-wrap').getBoundingClientRect();
      sky.burst(r.left + r.width * .8, r.top + r.height * .55, MOBILE ? 6 : 10, ['blue', 'violet']);
    }, null, 2.2);
}

/* ─────────────────────────────────────────────────────────────
   DECK — la página entera son diapositivas que se deslizan de lado
   (dedo, arrastre con mouse, flechas, rueda, teclado y puntitos)
   ───────────────────────────────────────────────────────────── */
function revealSlide(slide) {
  if (!HAS_GSAP) return;
  $$('.split', slide).forEach(el => {
    gsap.fromTo($$('.ch', el), { x: -40, y: 10, opacity: 0, filter: 'blur(10px)' },
      { x: 0, y: 0, opacity: 1, filter: 'blur(0px)', duration: .9, stagger: .045, ease: 'power3.out', delay: .35, clearProps: 'filter' });
  });
  $$('.rule', slide).forEach(el => gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut', delay: .45 }));
  $$('[data-reveal]', slide).forEach((el, i) => {
    const dir = el.dataset.reveal === 'right' ? 1 : -1;
    gsap.fromTo(el, { x: dir * Math.min(innerWidth * .6, 380), rotate: dir * 5, opacity: 0 },
      { x: 0, rotate: 0, opacity: 1, duration: 1.3, ease: 'expo.out', delay: .5 + Math.min(i, 8) * .07 });
  });
}

function playMeet(sky) {
  if (!HAS_GSAP) return;
  const stage = $('.meet-stage'), half = stage.clientWidth / 2;
  const hp = $('#meetHeart'), hl = hp.getTotalLength();
  const L = '.meet-bf.l', R = '.meet-bf.r', gap = 46;
  gsap.killTweensOf([L, R, '.meet-trail', '.meet-flash', hp, '.meet-text']);
  gsap.timeline({ delay: .6 })
    .set(hp, { fill: 'rgba(255,79,126,0)', strokeDasharray: hl, strokeDashoffset: hl })
    .set('.meet-trail', { opacity: 1 })
    .set('.meet-text', { x: -60, opacity: 0 })
    .fromTo(L, { x: -half, y: 0, scale: 1, rotate: 0, opacity: 1 }, { x: -gap, duration: 2.2, ease: 'power1.inOut' }, 0)
    .fromTo(R, { x: half, y: 0, scale: 1, rotate: 0, opacity: 1 }, { x: gap, duration: 2.2, ease: 'power1.inOut' }, 0)
    .fromTo('.meet-trail', { scaleX: 0 }, { scaleX: 1 - gap / half, duration: 2.2, ease: 'power1.inOut' }, 0)
    .to('.meet-trail', { opacity: 0, duration: .5 }, 2.2)
    .call(() => { const r = stage.getBoundingClientRect(); sky.burst(r.left + r.width / 2, r.top + r.height / 2, MOBILE ? 10 : 18, ['blue', 'violet', 'rose']); }, null, 2.2)
    .fromTo('.meet-flash', { scale: .2, opacity: 0 }, { scale: 1.2, opacity: 1, duration: .25 }, 2.2)
    .to('.meet-flash', { scale: 2, opacity: 0, duration: .7 }, 2.45)
    .to(L, { x: -Math.min(half * .4, 120), y: -90, scale: .6, rotate: -20, duration: 1, ease: 'expo.out' }, 2.3)
    .to(R, { x: Math.min(half * .4, 120), y: -90, scale: .6, rotate: 20, duration: 1, ease: 'expo.out' }, 2.3)
    .to(hp, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 2.4)
    .to(hp, { fill: 'rgba(255,79,126,.85)', duration: .8 }, 3.4)
    .to('.meet-text', { x: 0, opacity: 1, duration: 1.2, ease: 'expo.out' }, 3.4);
}

function initPromises(sky) {
  const stage = $('#pStage'), cards = $$('.p-card', stage), fill = $('#hFill'), bf = $('#hBf'), num = $('#pNum');
  let cur = 0, timer = null;
  const paint = () => { const k = (cur + 1) / cards.length; fill.style.transform = `scaleX(${k})`; bf.style.left = k * 100 + '%'; num.textContent = cur + 1; };
  if (HAS_GSAP) gsap.set(cards, { opacity: i => (i ? 0 : 1) });
  function show(i, dir = 1) {
    i = (i + cards.length) % cards.length; if (i === cur) return;
    const a = cards[cur], b = cards[i]; cur = i; paint();
    if (!HAS_GSAP) { a.style.opacity = 0; b.style.opacity = 1; return; }
    // la promesa actual se va hacia un lado y la nueva llega desde el otro
    gsap.to(a, { x: dir * 180, rotateY: dir * 30, opacity: 0, duration: .7, ease: 'power2.in' });
    gsap.fromTo(b, { x: -dir * 220, rotateY: -dir * 30, opacity: 0 }, { x: 0, rotateY: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: .25 });
    const r = stage.getBoundingClientRect(); sky.sparks(r.left + 30, r.top + 20, 10, ['gold', 'white']);
  }
  const next = () => show(cur + 1, 1), prev = () => show(cur - 1, -1);
  $('#pNext').addEventListener('click', e => { e.stopPropagation(); next(); restart(); });
  $('#pPrev').addEventListener('click', e => { e.stopPropagation(); prev(); restart(); });
  stage.addEventListener('click', () => { next(); restart(); });
  const restart = () => { stop(); timer = setInterval(next, 5500); };
  const stop = () => { clearInterval(timer); timer = null; };
  paint();
  return { start: restart, stop };
}

function initDeck(sky, hooks) {
  const track = $('#track'), slides = $$('.slide', track), dotsEl = $('#dots');
  const prevBtn = $('#navPrev'), nextBtn = $('#navNext');
  // cada diapositiva (menos la portada) lleva un contenedor interior centrado
  slides.forEach(s => { if (s.classList.contains('hero')) return; const inner = document.createElement('div'); inner.className = 'inner'; while (s.firstChild) inner.appendChild(s.firstChild); s.appendChild(inner); });
  $$('.split').forEach(splitText);
  const names = ['Inicio', 'Encuentro', 'Mariposas', 'Carta', 'Tiempo', 'Espíritus', 'Promesas', 'Te amo'];
  const dots = slides.map((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', names[i] || 'Diapositiva ' + (i + 1)); b.addEventListener('click', () => go(i)); dotsEl.appendChild(b); return b; });

  let idx = 0, busy = false;
  const W = () => innerWidth;
  const setX = x => { if (HAS_GSAP) gsap.set(track, { x }); else track.style.transform = `translateX(${x}px)`; };
  function ui() {
    dots.forEach((d, i) => d.classList.toggle('on', i === idx));
    prevBtn.disabled = idx === 0; nextBtn.disabled = idx === slides.length - 1;
  }
  function go(i, fromDrag = false) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const changed = i !== idx, dir = Math.sign(i - idx);
    if (changed) { hooks.leave?.(idx); slides[i].scrollTop = 0; revealSlide(slides[i]); hooks.enter?.(i); }
    idx = i; ui();
    if (!HAS_GSAP) { setX(-idx * W()); DECK.pos = idx; return; }
    busy = true;
    gsap.to(track, { x: -idx * W(), duration: fromDrag ? .8 : 1.15, ease: 'expo.out', overwrite: true,
      onUpdate: () => { DECK.pos = -gsap.getProperty(track, 'x') / W(); }, onComplete: () => { busy = false; } });
    if (changed) {
      // destello que cruza la pantalla en el sentido del deslizamiento
      for (let k = 0; k < 6; k++) setTimeout(() => sky.sparks(dir > 0 ? innerWidth - 20 : 20, rand(innerHeight * .2, innerHeight * .8), 6, ['blue', 'violet', 'white']), k * 60);
    }
  }
  const next = () => go(idx + 1), prev = () => go(idx - 1);
  prevBtn.addEventListener('click', prev); nextBtn.addEventListener('click', next);
  addEventListener('keydown', e => {
    if (!$('#modal').hidden || document.body.classList.contains('locked')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
  });

  /* rueda / trackpad: si la diapositiva ya no tiene más que bajar, pasa a la siguiente */
  let wheelLock = false;
  addEventListener('wheel', e => {
    if (wheelLock || document.body.classList.contains('locked') || !$('#modal').hidden) return;
    const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY), d = horiz ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 14) return;
    if (!horiz) {
      const s = slides[idx], atTop = s.scrollTop <= 1, atEnd = s.scrollTop + s.clientHeight >= s.scrollHeight - 2;
      if ((d > 0 && !atEnd) || (d < 0 && !atTop)) return;
    }
    d > 0 ? next() : prev();
    wheelLock = true; setTimeout(() => (wheelLock = false), 1000);
  }, { passive: true });

  /* deslizar con el dedo o arrastrar con el mouse: la página sigue al dedo */
  let start = null, dragging = false, justDragged = false;
  track.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('#pStage')) return;
    start = { x: e.clientX, y: e.clientY, t: performance.now() }; dragging = false;
  });
  addEventListener('pointermove', e => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!dragging) {
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) { dragging = true; if (HAS_GSAP) gsap.killTweensOf(track); }
      else if (Math.abs(dy) > 12) { start = null; return; }
    }
    if (dragging) {
      const edge = (idx === 0 && dx > 0) || (idx === slides.length - 1 && dx < 0);
      setX(-idx * W() + dx * (edge ? .3 : 1));
      DECK.pos = idx - dx / W();
    }
  });
  const end = e => {
    if (!start) return;
    const dx = e.clientX - start.x, v = dx / Math.max(1, performance.now() - start.t);
    if (dragging) {
      justDragged = true; setTimeout(() => (justDragged = false), 50);
      if (dx < -W() * .16 || v < -.45) go(idx + 1, true);
      else if (dx > W() * .16 || v > .45) go(idx - 1, true);
      else go(idx, true);
    }
    start = null; dragging = false;
  };
  addEventListener('pointerup', end); addEventListener('pointercancel', e => { if (dragging) end(e); else start = null; });
  track.addEventListener('click', e => { if (justDragged) { e.stopPropagation(); e.preventDefault(); } }, true);
  addEventListener('resize', () => setX(-idx * W()));

  ui();
  return { go, get index() { return idx; } };
}
