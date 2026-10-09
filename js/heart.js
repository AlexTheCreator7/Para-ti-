/* ════════════════════════════════════════════════════════════════════
   HEART — corazón 3D de partículas que late (Three.js)
   ════════════════════════════════════════════════════════════════════ */
function initHeart() {
  const stage = $('#heartStage'), canvas = $('#heartCanvas');
  if (!window.THREE) { stage.classList.add('fallback'); return null; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); }
  catch (e) { stage.classList.add('fallback'); return null; }
  const pr = Math.min(devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(pr); renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(42, 1, .1, 50); cam.position.set(0, 0, 6.6);
  const root = new THREE.Group(); scene.add(root);

  const glowTex = (() => {
    const s = document.createElement('canvas'); s.width = s.height = 128;
    const g = s.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.18, 'rgba(255,255,255,.7)'); gr.addColorStop(.5, 'rgba(255,255,255,.15)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(s);
  })();

  /* cuerpo del corazón: partículas dentro del volumen + halo exterior */
  const N = MOBILE ? 8000 : 14000;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), rnd = new Float32Array(N), size = new Float32Array(N);
  const PAL = [[1, .1, .28], [1, .3, .48], [1, .55, .7], [.78, .04, .22], [1, .88, .93], [.75, .55, 1]];
  /* corazón implícito (x²+y²−1)³ − x²y³ ≤ 0, muestreado de forma uniforme */
  const F = (x, y) => Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y;
  const S = 1.18;
  for (let i = 0; i < N; i++) {
    const kind = Math.random();               // 0–.55 interior · .55–.88 borde · resto halo
    let x, y, f;
    for (;;) {
      x = rand(-1.25, 1.25); y = rand(-1.1, 1.35); f = F(x, y);
      if (kind < .55 ? f <= 0 : kind < .88 ? (f <= 0 && f > -.07) : (f > .02 && f < .9)) break;
    }
    const halo = kind >= .88, edge = !halo && kind >= .55;
    const th = halo ? .3 : .55 * Math.pow(Math.max(0, -f), .35) + .05;
    pos[i * 3] = x * S; pos[i * 3 + 1] = (y - .12) * S; pos[i * 3 + 2] = (Math.random() * 2 - 1) * th;
    const c = halo ? (Math.random() < .3 ? PAL[5] : PAL[2]) : edge ? (Math.random() < .35 ? PAL[4] : PAL[1]) : pick([PAL[0], PAL[0], PAL[3], PAL[1]]);
    col.set(c, i * 3); rnd[i] = Math.random(); size[i] = halo ? rand(1.5, 3.5) : edge ? rand(3, 6.5) : rand(3, 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const uni = { uTime: { value: 0 }, uBeat: { value: 0 }, uBurst: { value: 0 }, uPix: { value: pr }, uTex: { value: glowTex } };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uTime; uniform float uBeat; uniform float uBurst; uniform float uPix;
      attribute vec3 aColor; attribute float aRand; attribute float aSize;
      varying vec3 vC; varying float vA;
      void main(){
        vec3 p = position;
        p *= 1. + uBeat * .075 * (.6 + aRand * .6);
        vec3 dir = normalize(p + vec3(.0001, .0001, .0001));
        p += dir * uBurst * (.8 + aRand * 2.6);
        p += .025 * vec3(sin(uTime*1.3 + aRand*40.), cos(uTime*1.1 + aRand*31.), sin(uTime*.9 + aRand*17.));
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPix * (1. + uBeat * .4) * (5.5 / -mv.z);
        vC = aColor; vA = .55 + .45 * sin(uTime * 2.5 + aRand * 60.);
      }`,
    fragmentShader: `
      uniform sampler2D uTex; varying vec3 vC; varying float vA;
      void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(vC * vA, t.a * vA * .9); }`,
  });
  const heart = new THREE.Points(geo, mat); root.add(heart);

  /* resplandor central */
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff2a62, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .5 }));
  core.scale.set(3.6, 3.6, 1); root.add(core);

  /* anillos de luz orbitando */
  const ring = (n, R, color, sz) => {
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU + rand(-.02, .02), rr = R + rand(-.06, .06); p[i * 3] = Math.cos(a) * rr; p[i * 3 + 1] = rand(-.03, .03); p[i * 3 + 2] = Math.sin(a) * rr; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex, color, size: sz, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .85 }));
  };
  const ring1 = ring(MOBILE ? 500 : 900, 1.95, 0xffb3c9, .06); ring1.rotation.x = 1.2; root.add(ring1);
  const ring2 = ring(MOBILE ? 400 : 700, 2.2, 0x9fd0ff, .05); ring2.rotation.x = -1.0; ring2.rotation.z = .5; root.add(ring2);

  /* chispas que suben */
  const EN = MOBILE ? 160 : 300;
  const ep = new Float32Array(EN * 3), ev = new Float32Array(EN);
  for (let i = 0; i < EN; i++) { ep[i * 3] = rand(-2, 2); ep[i * 3 + 1] = rand(-2.4, 2.6); ep[i * 3 + 2] = rand(-1, 1); ev[i] = rand(.2, .7); }
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(ep, 3));
  const embers = new THREE.Points(eg, new THREE.PointsMaterial({ map: glowTex, color: 0xff7aa3, size: .09, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 }));
  scene.add(embers);

  const beatAt = t => { const m = t % 1.2; return Math.exp(-Math.pow((m - .05) / .06, 2)) + .6 * Math.exp(-Math.pow((m - .3) / .07, 2)); };
  const resize = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  resize(); addEventListener('resize', resize);

  const ptr = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); ptr.x = (e.clientX - r.left) / r.width * 2 - 1; ptr.y = (e.clientY - r.top) / r.height * 2 - 1; });
  stage.addEventListener('pointerleave', () => { ptr.x = ptr.y = 0; });

  let visible = false, running = false, last = performance.now(), T = 0;
  function frame(now) {
    if (!visible) { running = false; return; }
    const dt = Math.min((now - last) / 1000, .05); last = now; T += dt;
    const b = beatAt(T);
    uni.uTime.value = T; uni.uBeat.value = b;
    cur.x += (ptr.x - cur.x) * .05; cur.y += (ptr.y - cur.y) * .05;
    root.rotation.y = Math.sin(T * .45) * .55 + cur.x * .7;
    root.rotation.x = cur.y * .35;
    core.material.opacity = .35 + b * .35; core.scale.setScalar(3.4 + b * .7);
    ring1.rotation.y += dt * .5; ring2.rotation.y -= dt * .35;
    const a = eg.attributes.position.array;
    for (let i = 0; i < EN; i++) { a[i * 3 + 1] += ev[i] * dt; a[i * 3] += Math.sin(T + i) * .002; if (a[i * 3 + 1] > 2.7) { a[i * 3 + 1] = -2.4; a[i * 3] = rand(-2, 2); } }
    eg.attributes.position.needsUpdate = true;
    renderer.render(scene, cam);
    requestAnimationFrame(frame);
  }
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  }, { rootMargin: '120px' }).observe(stage);

  return {
    burst() {
      if (HAS_GSAP) {
        gsap.killTweensOf(uni.uBurst);
        gsap.timeline().to(uni.uBurst, { value: 1, duration: .35, ease: 'power3.out' }).to(uni.uBurst, { value: 0, duration: 2, ease: 'elastic.out(1,.45)' });
      }
    },
  };
}
