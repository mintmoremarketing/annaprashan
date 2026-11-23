const canvas = document.getElementById('scratchCanvas');
const card = document.getElementById('scratchCard');
const revealButton = document.getElementById('revealButton');
const context = canvas.getContext('2d', { willReadFrequently: true });

let isDrawing = false;
let revealed = false;
let strokes = 0;

function paintCover() {
  if (revealed) return;
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * pixelRatio);
  canvas.height = Math.round(bounds.height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.globalCompositeOperation = 'source-over';
  context.fillStyle = '#dfb6bc';
  context.fillRect(0, 0, bounds.width, bounds.height);
  context.strokeStyle = 'rgba(255, 248, 244, 0.42)';
  context.lineWidth = 1.5;
  context.strokeRect(21, 21, bounds.width - 42, bounds.height - 42);
  context.fillStyle = '#724954';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `400 ${Math.min(bounds.width * 0.095, 66)}px "Cormorant Garamond", Georgia, serif`;
  context.fillText('A date to celebrate', bounds.width / 2, bounds.height / 2 - 17);
  context.font = '600 12px "DM Sans", sans-serif';
  context.fillText('SCRATCH TO REVEAL', bounds.width / 2, bounds.height / 2 + 45);
}

function reveal() {
  if (revealed) return;
  revealed = true;
  card.classList.add('is-revealed');
  revealButton.textContent = 'Date revealed';
  revealButton.disabled = true;
  bloomPetals();
}

function bloomPetals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const holder = card.querySelector('.scratch-petals');
  for (let index = 0; index < 8; index++) {
    const petal = document.createElement('span');
    petal.style.setProperty('--petal-angle', `${index * 45}deg`);
    petal.style.setProperty('--petal-delay', `${index * 35}ms`);
    holder.append(petal);
    petal.addEventListener('animationend', () => petal.remove(), { once: true });
  }
}

function scratch(event) {
  const bounds = canvas.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  context.globalCompositeOperation = 'destination-out';
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = Math.max(35, bounds.width * 0.095);
  if (event.type === 'pointerdown') {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + .1, y + .1);
    context.stroke();
  } else {
    context.lineTo(x, y);
    context.stroke();
  }
  strokes += 1;
  if (strokes % 12 === 0) {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let index = 3; index < pixels.length; index += 40) {
      if (pixels[index] < 60) cleared++;
    }
    if (cleared / (pixels.length / 40) > .34) reveal();
  }
}

canvas.addEventListener('pointerdown', event => {
  if (revealed) return;
  isDrawing = true;
  canvas.setPointerCapture(event.pointerId);
  scratch(event);
});
canvas.addEventListener('pointermove', event => {
  if (isDrawing && !revealed) scratch(event);
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  canvas.addEventListener(type, () => { isDrawing = false; });
}
revealButton.addEventListener('click', reveal);
window.addEventListener('resize', paintCover);
document.fonts.ready.then(paintCover);

const blessingButton = document.getElementById('blessingButton');
const blessingText = document.getElementById('blessingText');
const fallingLeaves = document.getElementById('fallingLeaves');
const blessings = [
  'May your days be full of wonder.',
  'May you grow surrounded by love.',
  'May every new beginning bring you joy.'
];
let blessingIndex = 0;

blessingButton.addEventListener('click', () => {
  blessingText.textContent = blessings[blessingIndex];
  blessingIndex = (blessingIndex + 1) % blessings.length;
  blessingText.classList.remove('wish-arrives');
  void blessingText.offsetWidth;
  blessingText.classList.add('wish-arrives');
  blessingButton.classList.remove('note-opened');
  void blessingButton.offsetWidth;
  blessingButton.classList.add('note-opened');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (let index = 0; index < 11; index++) {
      const leaf = document.createElement('span');
      leaf.style.setProperty('--leaf-x', `${12 + Math.random() * 76}%`);
      leaf.style.setProperty('--leaf-size', `${8 + Math.random() * 8}px`);
      leaf.style.setProperty('--leaf-shift', `${-95 + Math.random() * 190}px`);
      leaf.style.setProperty('--leaf-turn', `${-450 + Math.random() * 900}deg`);
      leaf.style.setProperty('--leaf-duration', `${1.9 + Math.random() * .9}s`);
      leaf.style.setProperty('--leaf-delay', `${Math.random() * .45}s`);
      leaf.style.setProperty('--leaf-color', index % 3 === 0 ? '#c4a174' : '#b97786');
      fallingLeaves.append(leaf);
      leaf.addEventListener('animationend', () => leaf.remove(), { once: true });
    }
  }
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!prefersReducedMotion.matches && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.section-heading, .scratch-layout, .note-copy, .venue-top, .venue-bottom, .site-footer');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in-view');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  for (const element of revealTargets) {
    element.classList.add('scroll-reveal');
    observer.observe(element);
  }
}

const heroArt = document.querySelector('.hero-art');
if (!prefersReducedMotion.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let frame = 0;
  const movePortrait = () => {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    heroArt.style.setProperty('--portrait-x', `${currentX.toFixed(2)}px`);
    heroArt.style.setProperty('--portrait-y', `${currentY.toFixed(2)}px`);
    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.3) {
      frame = requestAnimationFrame(movePortrait);
    } else {
      frame = 0;
    }
  };
  const requestMove = () => { if (!frame) frame = requestAnimationFrame(movePortrait); };
  heroArt.addEventListener('pointermove', event => {
    const bounds = heroArt.getBoundingClientRect();
    targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 15;
    targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 15;
    requestMove();
  });
  heroArt.addEventListener('pointerleave', () => {
    targetX = 0;
    targetY = 0;
    requestMove();
  });
}

const openingGate = document.getElementById('openingGate');
const stirScene = document.getElementById('stirScene');
const stirHit = document.getElementById('stirHit');
const stirProgress = document.getElementById('stirProgress');
const openingProgress = document.getElementById('openingProgress');
const openingSkip = document.getElementById('openingSkip');
const replayOpening = document.getElementById('replayOpening');
const songPanel = document.getElementById('songPanel');
const songStatus = document.getElementById('songStatus');
const songClose = document.getElementById('songClose');
const musicToggles = document.querySelectorAll('[data-music-toggle]');
const pageRegions = document.querySelectorAll('.skip-link, .site-header, main, .site-footer');
let musicEnabled = true;
let songPlayer = null;
let songPlayerReady = false;
let playWhenReady = false;
let stirring = false;
let lastStirAngle = null;
let totalStir = 0;
let visualStir = 0;
let gateOpening = false;

function updateMusicToggles() {
  for (const button of musicToggles) {
    button.setAttribute('aria-pressed', String(musicEnabled));
    button.querySelector('.music-label').textContent = musicEnabled ? 'Music on' : 'Music off';
  }
}

function showSongPanel() {
  if (!musicEnabled) return;
  songPanel.hidden = false;
  playWhenReady = true;
  if (songPlayerReady) songPlayer.playVideo();
}

function closeSongPanel() {
  musicEnabled = false;
  playWhenReady = false;
  if (songPlayerReady) songPlayer.pauseVideo();
  songPanel.hidden = true;
  updateMusicToggles();
}

window.onYouTubeIframeAPIReady = () => {
  songPlayer = new YT.Player('songPlayer', {
    width: 240,
    height: 200,
    videoId: 'TVbI55pDdaI',
    playerVars: { playsinline: 1, controls: 1, rel: 0, origin: window.location.origin },
    events: {
      onReady: () => {
        songPlayerReady = true;
        if (playWhenReady && !songPanel.hidden) songPlayer.playVideo();
      },
      onAutoplayBlocked: () => { songStatus.textContent = 'Tap play in the video to hear the song.'; },
      onError: () => { songStatus.textContent = 'Open the song on YouTube below.'; }
    }
  });
};
const youtubeApi = document.createElement('script');
youtubeApi.src = 'https://www.youtube.com/iframe_api';
youtubeApi.async = true;
youtubeApi.addEventListener('error', () => { songStatus.textContent = 'Open the song on YouTube below.'; });
document.head.append(youtubeApi);

for (const button of musicToggles) button.addEventListener('click', () => {
  if (musicEnabled) closeSongPanel();
  else {
    musicEnabled = true;
    updateMusicToggles();
    showSongPanel();
  }
});
songClose.addEventListener('click', closeSongPanel);

function setPageInert(value) {
  for (const region of pageRegions) region.inert = value;
}

function stirAngle(event) {
  const bounds = stirScene.getBoundingClientRect();
  return Math.atan2(event.clientY - bounds.top - bounds.height / 2, event.clientX - bounds.left - bounds.width / 2) * 180 / Math.PI;
}

function updateStir() {
  const progress = Math.min(totalStir / 350, 1);
  stirScene.style.setProperty('--spoon-angle', `${visualStir.toFixed(1)}deg`);
  stirScene.style.setProperty('--stir-rotation', `${(visualStir * .38).toFixed(1)}deg`);
  stirProgress.style.strokeDashoffset = `${100 - progress * 100}`;
  openingProgress.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  openingProgress.textContent = progress ? `${Math.round(progress * 100)}% stirred` : 'Stir once around to open';
}

function openInvitation() {
  if (gateOpening || !document.body.classList.contains('has-opening')) return;
  showSongPanel();
  gateOpening = true;
  openingProgress.textContent = 'Welcome to Smriti’s day';
  openingGate.classList.add('is-opening');
  const finish = () => {
    document.body.classList.remove('has-opening');
    openingGate.classList.remove('is-opening');
    setPageInert(false);
    document.getElementById('hero-title').focus({ preventScroll: true });
    gateOpening = false;
  };
  window.setTimeout(finish, prefersReducedMotion.matches ? 0 : 550);
}

stirHit.addEventListener('pointerdown', event => {
  if (gateOpening) return;
  stirring = true;
  lastStirAngle = stirAngle(event);
  stirHit.setPointerCapture(event.pointerId);
});
stirHit.addEventListener('pointermove', event => {
  if (!stirring || gateOpening) return;
  const angle = stirAngle(event);
  let delta = angle - lastStirAngle;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  lastStirAngle = angle;
  if (Math.abs(delta) > 90) return;
  visualStir += delta;
  totalStir += Math.abs(delta);
  updateStir();
  if (totalStir >= 350) openInvitation();
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  stirHit.addEventListener(type, () => { stirring = false; lastStirAngle = null; });
}
stirHit.addEventListener('click', event => {
  if (event.detail === 0) openInvitation();
});
stirHit.addEventListener('keydown', event => {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
  event.preventDefault();
  const turn = event.key === 'ArrowRight' ? 45 : -45;
  visualStir += turn;
  totalStir += Math.abs(turn);
  updateStir();
  if (totalStir >= 350) openInvitation();
});
openingSkip.addEventListener('click', openInvitation);
replayOpening.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  totalStir = 0;
  visualStir = 0;
  updateStir();
  setPageInert(true);
  document.body.classList.add('has-opening');
  stirHit.focus();
});
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('has-opening')) openInvitation();
});
setPageInert(true);
stirHit.focus({ preventScroll: true });

const heroStage = document.getElementById('heroStage');
let heroScrollFrame = 0;
function updateHeroScroll() {
  heroScrollFrame = 0;
  if (prefersReducedMotion.matches) {
    heroStage.style.setProperty('--hero-progress', '0');
    return;
  }
  const bounds = heroStage.getBoundingClientRect();
  const scrollDistance = Math.max(1, heroStage.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -bounds.top / scrollDistance));
  heroStage.style.setProperty('--hero-progress', progress.toFixed(3));
}
function requestHeroScroll() {
  if (!heroScrollFrame) heroScrollFrame = requestAnimationFrame(updateHeroScroll);
}
window.addEventListener('scroll', requestHeroScroll, { passive: true });
window.addEventListener('resize', requestHeroScroll);
requestHeroScroll();
