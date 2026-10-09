/* ════════════════════════════════════════════════════════════════════
   PIANO — vals original en re menor (Web Audio, sin archivos)
   ════════════════════════════════════════════════════════════════════ */
function createPiano() {
  let ctx, master, bus, timer = null, nextTime = 0, step = 0, playing = false;
  const BEAT = .52;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const SONG = [
    { b: 38, c: [57, 62, 65], m: [[74, 2], [76, 1]] },
    { b: 34, c: [58, 62, 65], m: [[77, 2], [74, 1]] },
    { b: 41, c: [57, 60, 65], m: [[72, 2], [69, 1]] },
    { b: 33, c: [55, 61, 64], m: [[73, 3]] },
    { b: 38, c: [57, 62, 65], m: [[74, 1], [77, 1], [81, 1]] },
    { b: 43, c: [55, 58, 62], m: [[79, 2], [77, 1]] },
    { b: 45, c: [57, 61, 64], m: [[76, 1], [73, 1], [76, 1]] },
    { b: 38, c: [57, 62, 65], m: [[74, 3]] },
  ];
  function impulse(sec) {
    const rate = ctx.sampleRate, len = Math.floor(rate * sec), b = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
    return b;
  }
  function init() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    bus = ctx.createBiquadFilter(); bus.type = 'lowpass'; bus.frequency.value = 2900;
    const dry = ctx.createGain(); dry.gain.value = .75;
    const wet = ctx.createGain(); wet.gain.value = .5;
    const conv = ctx.createConvolver(); conv.buffer = impulse(3.4);
    bus.connect(dry).connect(master); bus.connect(conv).connect(wet).connect(master);
  }
  function note(t, m, v, len) {
    const f = mtof(m), g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .008);
    g.gain.exponentialRampToValueAtTime(v * .3, t + .3); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    const parts = [['triangle', 1, 1], ['sine', 2, .25], ['sine', 3.01, .07]];
    parts.forEach(([type, mul, amp]) => {
      const o = ctx.createOscillator(), a = ctx.createGain();
      o.type = type; o.frequency.value = f * mul; a.gain.value = amp;
      o.connect(a).connect(g); o.start(t); o.stop(t + len + .05);
    });
    g.connect(bus);
  }
  function bar(t, B, loop) {
    note(t, B.b, .3, 2.8); note(t, B.b + 12, .1, 2.2);
    B.c.forEach(m => { note(t + BEAT, m, .06, 1.3); note(t + 2 * BEAT, m, .05, 1.3); });
    let mt = t; B.m.forEach(([m, beats]) => { note(mt, m, .2, beats * BEAT + 1.8); mt += beats * BEAT; });
    if (loop % 2 === 1) B.c.forEach((m, i) => note(t + i * BEAT * .5 + BEAT * 1.5, m + 24, .035, 1.6));
  }
  function tick() {
    while (nextTime < ctx.currentTime + .6) { bar(nextTime, SONG[step % SONG.length], Math.floor(step / SONG.length)); nextTime += BEAT * 3; step++; }
  }
  return {
    get playing() { return playing; },
    start() {
      if (!ctx) init();
      ctx.resume(); playing = true;
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(.55, ctx.currentTime, .8);
      if (!timer) { nextTime = ctx.currentTime + .15; tick(); timer = setInterval(tick, 120); }
    },
    stop() {
      if (!ctx) return; playing = false;
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, .25);
      setTimeout(() => { if (!playing) { clearInterval(timer); timer = null; ctx.suspend(); } }, 1200);
    },
  };
}
