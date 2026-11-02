// Effekte: Umgebungspartikel, Treffer-Funkenburst und Nachbearbeitung (Bloom, Tilt-Shift, Vignette).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { HorizontalTiltShiftShader } from 'three/addons/shaders/HorizontalTiltShiftShader.js';
import { VerticalTiltShiftShader } from 'three/addons/shaders/VerticalTiltShiftShader.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';
import { rng } from './core/pixel.js';

/** Schwebende Glut/Pollen/Glühwürmchen und der Funkenburst bei Treffern */
export function createParticles(scene, { reduceMotion }) {
  const AMB = 90, ambPos = new Float32Array(AMB * 3), ambSeed = new Float32Array(AMB);
  const ar = rng(21);
  for (let i = 0; i < AMB; i++) { ambPos[i * 3] = -9 + ar() * 18; ambPos[i * 3 + 1] = ar() * 5; ambPos[i * 3 + 2] = -5 + ar() * 9; ambSeed[i] = ar() * 6.28; }
  const ambGeo = new THREE.BufferGeometry(); ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
  const ambMat = new THREE.PointsMaterial({ size: .09, color: '#FFB067', transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending });
  const ambient = new THREE.Points(ambGeo, ambMat); scene.add(ambient);

  const BURST = 36, bPos = new Float32Array(BURST * 3), bVel = new Float32Array(BURST * 3);
  const bGeo = new THREE.BufferGeometry(); bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
  const bMat = new THREE.PointsMaterial({ size: .14, color: '#FFD25E', transparent: true, opacity: 1, depthWrite: false });
  const burst = new THREE.Points(bGeo, bMat); burst.visible = false; scene.add(burst);
  let burstT = 0;

  return {
    setTime(t) { ambMat.color.set(t.particle).multiplyScalar(1.6); },
    setAmbientVisible(on) { ambient.visible = on; },
    /** Funkenburst an Position `at` in Farbe `color` */
    burst(at, color) {
      for (let i = 0; i < BURST; i++) {
        bPos[i * 3] = at.x; bPos[i * 3 + 1] = at.y; bPos[i * 3 + 2] = at.z + .05;
        const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 2.5;
        bVel[i * 3] = Math.cos(a) * s; bVel[i * 3 + 1] = 1.5 + Math.random() * 3; bVel[i * 3 + 2] = Math.sin(a) * s * .4;
      }
      bMat.color.set(color).multiplyScalar(2.2); burstT = 0.7; burst.visible = true; bGeo.attributes.position.needsUpdate = true;
    },
    update(dt, time) {
      if (ambient.visible) {
        const speed = reduceMotion ? .1 : .35;
        for (let i = 0; i < AMB; i++) {
          ambPos[i * 3 + 1] += dt * speed * (.6 + (i % 5) * .15);
          ambPos[i * 3] += Math.sin(time * .8 + ambSeed[i]) * dt * .15;
          if (ambPos[i * 3 + 1] > 5) ambPos[i * 3 + 1] = 0;
        }
        ambGeo.attributes.position.needsUpdate = true;
      }
      if (burstT > 0) {
        burstT -= dt;
        for (let i = 0; i < BURST; i++) {
          bVel[i * 3 + 1] -= 9 * dt;
          bPos[i * 3] += bVel[i * 3] * dt; bPos[i * 3 + 1] = Math.max(.02, bPos[i * 3 + 1] + bVel[i * 3 + 1] * dt); bPos[i * 3 + 2] += bVel[i * 3 + 2] * dt;
        }
        bGeo.attributes.position.needsUpdate = true; bMat.opacity = Math.max(0, burstT / .7);
        if (burstT <= 0) burst.visible = false;
      }
    }
  };
}

/** Nachbearbeitung: Bloom → Output (Tonemapping/sRGB) → Tilt-Shift H+V → Vignette */
export function createPostFX(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), .55, .45, .85);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
  const tiltH = new ShaderPass(HorizontalTiltShiftShader), tiltV = new ShaderPass(VerticalTiltShiftShader);
  tiltH.uniforms.r.value = .45; tiltV.uniforms.r.value = .45;
  composer.addPass(tiltH); composer.addPass(tiltV);
  const vignettePass = new ShaderPass(VignetteShader);
  vignettePass.uniforms.offset.value = .95; vignettePass.uniforms.darkness.value = 1.25;
  composer.addPass(vignettePass);

  return {
    composer,
    setEnabled({ bloom, tilt, vignette }) { bloomPass.enabled = bloom; tiltH.enabled = tilt; tiltV.enabled = tilt; vignettePass.enabled = vignette; },
    /** Größe in CSS-Pixeln + Renderskalierung; Tilt-Shift-Stärke 4 px bezogen auf die Renderauflösung */
    setSize(w, h, scale) {
      composer.setPixelRatio(scale); composer.setSize(w, h);
      tiltH.uniforms.h.value = 4 / (w * scale); tiltV.uniforms.v.value = 4 / (h * scale);
    },
    render(dt) { composer.render(dt); }
  };
}
