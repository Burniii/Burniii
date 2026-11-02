// Einstieg: baut die Diorama-Probe aus den Modulen zusammen und betreibt die 30-fps-Schleife.
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/500.css';
import '@fontsource/pixelify-sans/600.css';
import '@fontsource/pixelify-sans/700.css';
import './style.css';

import * as THREE from 'three';
import { createStage, createAtmosphere, TIMES } from './scene.js';
import { createTerrain } from './terrain.js';
import { createSprites } from './sprites.js';
import { createParticles, createPostFX } from './fx.js';
import { createCombat } from './combat.js';
import { createQualityState } from './quality.js';
import { createUI } from './ui.js';
import { createAudio } from './audio.js';
import { PALETTES } from './data/creatures.js';

const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ui = createUI();

let stage3d;
try {
  stage3d = createStage(ui.canvas, { reduceMotion });
} catch (e) {
  ui.showError();
  throw e;
}
const { renderer, scene, camera } = stage3d;

// Reihenfolge wie im Prototyp: Gelände → Licht/Kulisse → Sprites → Partikel → Nachbearbeitung
const terrain = createTerrain(scene);
const atmo = createAtmosphere(scene, renderer);
const sprites = createSprites(scene);
const particles = createParticles(scene, { reduceMotion });
const post = createPostFX(renderer, scene, camera);
const audio = createAudio();
const quality = createQualityState();
let element = 'fire';

/* ---------- Kampf: Logik → Darstellung ---------- */
const combat = createCombat({
  onHit({ dmg, crit, hp }) {
    ui.setHp(hp);
    const v = sprites.enemy.mesh.position.clone(); v.y += 1.35; v.project(camera);
    ui.showDamage(dmg, crit, v);
    particles.burst(new THREE.Vector3(sprites.EN_BASE.x - .3, .6, sprites.EN_BASE.z), PALETTES[element].accent);
    stage3d.shake(crit ? .35 : .2);
    audio.play('hit', { element, crit });
  },
  onHurt() { stage3d.shake(.15); audio.play('hurt', { element }); },
  onRespawn({ hp }) { ui.setHp(hp); }
});

/* ---------- Einstellungen anwenden ---------- */
function setTime(key) {
  const t = TIMES[key];
  atmo.setTime(t); terrain.setTime(t); particles.setTime(t);
}
function setElement(id) {
  element = id;
  sprites.setElement(id);
  ui.setCreature(PALETTES[id]);
}
function applyFx() {
  const e = quality.effective();
  atmo.setShadows(e.shadows);
  terrain.setLightsVisible(e.lights);
  sprites.setNormals(e.lights);
  post.setEnabled(e);
  atmo.setFog(e.atmo); particles.setAmbientVisible(e.atmo);
  ui.renderFx(quality);
}
function resize() {
  const w = ui.stage.clientWidth, h = ui.stage.clientHeight; if (!w || !h) return;
  const { scale } = quality.preset;
  renderer.setPixelRatio(scale); renderer.setSize(w, h, false);
  post.setSize(w, h, scale);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  ui.setReadout('Render ' + Math.round(w * scale) + ' × ' + Math.round(h * scale) + ' px · max. 30 fps');
}
function setQuality(key) {
  quality.level = key;
  atmo.setShadowMapSize(quality.preset.shadow);
  resize();
}

ui.bind({
  onAttack: () => { if (combat.attack()) audio.play('attack', { element }); },
  onHurt: () => combat.hurt(),
  onElement: setElement,
  onTime: setTime,
  onQuality: setQuality,
  onFxToggle: (key) => { quality.toggle(key); applyFx(); },
  onCompare: () => { quality.compare = !quality.compare; applyFx(); }
});

/* ---------- Schleife (fest 30 fps) ---------- */
const clock = new THREE.Clock();
const FRAME = 1 / 30;
let acc = 0, time = 0;

function update(dt) {
  time += dt;
  stage3d.updateCamera(dt, time);
  sprites.applyPoses(combat.update(dt, time));
  sprites.faceCamera(camera);
  terrain.update(time);
  particles.update(dt, time);
}

function loop() {
  requestAnimationFrame(loop);
  acc += Math.min(clock.getDelta(), .1);
  if (acc < FRAME) return;
  const dt = acc; acc = 0;
  update(dt); post.render(dt);
}

setTime('dusk'); setQuality('mid'); applyFx(); ui.setHp(combat.enemyHp);
new ResizeObserver(resize).observe(ui.stage);
window.__dioramaReady = true;
loop();
