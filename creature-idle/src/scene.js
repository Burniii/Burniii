// Renderer, Kamera, Licht, Nebel, Hintergrundkulisse und Tageszeiten.
import * as THREE from 'three';
import { rng, canvasTex, px } from './core/pixel.js';

export const TIMES = {
  day:   { bg: '#A9DCF5', skyTop: '#7CC6F2', skyBot: '#CBEAF7', far: '#8DB6CF', near: '#7FA88E', disc: '#FFF6C8', stars: false,
           fog: '#CBE9F5', fogNear: 16, fogFar: 40, hemiSky: '#E4F4FF', hemiGround: '#6C8F5A', hemiI: 1.1,
           sun: '#FFF1D6', sunI: 2.4, sunPos: [-6, 10, 6], torch: .5, crystal: .3, particle: '#FFF2A8', exposure: 1.0 },
  dusk:  { bg: '#F2A97A', skyTop: '#B87AA8', skyBot: '#FFC48A', far: '#9C6A86', near: '#7E5A72', disc: '#FFE2A0', stars: false,
           fog: '#E9A07E', fogNear: 14, fogFar: 36, hemiSky: '#FFC79A', hemiGround: '#4C3A55', hemiI: .7,
           sun: '#FF9A5A', sunI: 1.9, sunPos: [-9, 4.5, 6], torch: 2.2, crystal: .9, particle: '#FFB067', exposure: 1.05 },
  night: { bg: '#18213A', skyTop: '#0E1428', skyBot: '#2A3A66', far: '#1E2A4A', near: '#18223C', disc: '#E8EEFF', stars: true,
           fog: '#1E2A48', fogNear: 12, fogFar: 32, hemiSky: '#4A5E9A', hemiGround: '#141826', hemiI: .5,
           sun: '#9FB8FF', sunI: .9, sunPos: [5, 9, 5], torch: 3.4, crystal: 2.6, particle: '#C8FF7A', exposure: 1.15 }
};

/** Renderer, Szene und Kamera. Wirft, wenn WebGL nicht verfügbar ist. */
export function createStage(canvas, { reduceMotion }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1.6, 0.5, 80);
  const CAM_BASE = new THREE.Vector3(0, 4.4, 12);
  const CAM_TARGET = new THREE.Vector3(0, 1.1, -1);
  camera.position.copy(CAM_BASE);
  camera.lookAt(CAM_TARGET);

  let shake = 0;
  return {
    renderer, scene, camera,
    /** Kameraerschütterung (Sekunden, klingt linear ab) */
    shake(amount) { shake = amount; },
    /** Langsames Schwenken + Erschütterung */
    updateCamera(dt, time) {
      camera.position.copy(CAM_BASE);
      if (!reduceMotion) camera.position.x += Math.sin(time * .18) * .7;
      if (shake > 0) { shake = Math.max(0, shake - dt); const s = shake * .35; camera.position.x += (Math.random() - .5) * s; camera.position.y += (Math.random() - .5) * s; }
      camera.lookAt(CAM_TARGET);
    }
  };
}

/* Pixel-Bergkette als Kulisse, je Tageszeit neu gezeichnet */
function drawBackdrop(p) {
  return canvasTex(160, 60, (g, w, h) => {
    const top = new THREE.Color(p.skyTop), bot = new THREE.Color(p.skyBot), tmp = new THREE.Color();
    const bands = 7;
    for (let i = 0; i < bands; i++) { tmp.copy(top).lerp(bot, i / (bands - 1)); g.fillStyle = '#' + tmp.getHexString(); g.fillRect(0, Math.floor(i * h / bands), w, Math.ceil(h / bands) + 1); }
    const r = rng(9);
    if (p.stars) for (let i = 0; i < 45; i++) px(g, Math.floor(r() * w), Math.floor(r() * 26), r() < .7 ? '#C9D6FF' : '#FFFFFF');
    if (p.disc) { g.fillStyle = p.disc; g.fillRect(118, 10, 8, 8); g.fillRect(117, 11, 10, 6); g.fillRect(119, 9, 6, 10); }
    let y = 30; g.fillStyle = p.far;
    for (let x = 0; x < w; x += 4) { y = Math.max(18, Math.min(40, y + Math.floor((r() - .5) * 9))); g.fillRect(x, y, 4, h - y); }
    y = 44; g.fillStyle = p.near;
    for (let x = 0; x < w; x += 3) { y = Math.max(36, Math.min(52, y + Math.floor((r() - .5) * 6))); g.fillRect(x, y, 3, h - y); }
  });
}

/** Himmelslicht, Sonne mit Schatten, Nebel und Kulisse. */
export function createAtmosphere(scene, renderer) {
  const hemi = new THREE.HemisphereLight('#FFC79A', '#4C3A55', .7); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FF9A5A', 1.8);
  sun.position.set(-6, 8, 7); sun.target.position.set(0, 0, 0); scene.add(sun); scene.add(sun.target);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 10, bottom: -8, near: 1, far: 40 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  const fog = new THREE.Fog('#E9A07E', 14, 36);
  scene.fog = fog;

  const backdropMat = new THREE.MeshBasicMaterial({ fog: false });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(84, 32), backdropMat);
  backdrop.position.set(0, 6, -20); scene.add(backdrop);

  return {
    sun,
    setTime(t) {
      scene.background = new THREE.Color(t.bg);
      fog.color.set(t.fog); fog.near = t.fogNear; fog.far = t.fogFar;
      hemi.color.set(t.hemiSky); hemi.groundColor.set(t.hemiGround); hemi.intensity = t.hemiI;
      sun.color.set(t.sun); sun.intensity = t.sunI; sun.position.set(...t.sunPos);
      renderer.toneMappingExposure = t.exposure;
      if (backdropMat.map) backdropMat.map.dispose();
      backdropMat.map = drawBackdrop(t); backdropMat.needsUpdate = true;
    },
    setShadows(on) { sun.castShadow = on; },
    setFog(on) { scene.fog = on ? fog : null; },
    setShadowMapSize(size) {
      if (sun.shadow.mapSize.x !== size) { sun.shadow.mapSize.set(size, size); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
    }
  };
}
