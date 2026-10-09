'use strict';
/* ════════════════════════════════════════════════════════════════════
   ARRANQUE
   ════════════════════════════════════════════════════════════════════ */
initTrees();
initFog();
const sky = initSky();
const heart = initHeart();
const piano = createSong(createPiano());
const syncMusic = initMusic(piano);
const letterVideo = initLetterVideo(piano, syncMusic);
initCards(sky); initLetter(sky); initCounter(); initSpirits(sky); initFinale(sky, heart);
const promises = initPromises(sky);
const deck = initDeck(sky, {
  enter(i) { const id = $$('.slide')[i].id; if (id === 'meet') playMeet(sky); if (id === 'promises') promises.start(); },
  leave(i) { const id = $$('.slide')[i].id; if (id === 'promises') promises.stop(); if (id === 'carta') letterVideo.pause(); },
});

document.body.classList.add('locked');
const intro = $('#intro');
let entered = false;
function enter(withMusic) {
  if (entered) return; entered = true;
  if (withMusic) { piano.start(); syncMusic(); }
  document.body.classList.remove('locked');
  heroIntro(sky);
  const fade = () => intro.remove();
  if (HAS_GSAP) gsap.to(intro, { opacity: 0, duration: 1.2, ease: 'power2.inOut', onComplete: fade }); else fade();
}
$('#introBtn').addEventListener('click', () => enter(true));
