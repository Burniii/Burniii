// Kreaturen als Pixel-Sprites im Raum: Raster → Farbtextur + automatische Normal-Map → beleuchtbare Billboards.
import * as THREE from 'three';
import { canvasTex, px } from './core/pixel.js';
import { PALETTES, CREATURE_HALF, SLIME_HALF, SLIME_COLORS, mirror, creatureColors, heightField } from './data/creatures.js';

const CREATURE = mirror(CREATURE_HALF);
const SLIME = mirror(SLIME_HALF);

/** Farbtextur und Normal-Map aus einem Zeichen-Raster */
export function spriteTextures(rows, colors) {
  const H = rows.length, W = rows[0].length;
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H && rows[y][x] !== '.';
  const hs = heightField(rows);
  const hv = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : hs[y][x];
  const map = canvasTex(W, H, (g) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const ch = rows[y][x]; if (ch !== '.') px(g, x, y, colors[ch]); } });
  const normal = canvasTex(W, H, (g) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!inside(x, y)) { px(g, x, y, 'rgb(128,128,255)'); continue; }
      let nx = -(hv(x + 1, y) - hv(x - 1, y)) * .55, ny = -(hv(x, y - 1) - hv(x, y + 1)) * .55, nz = 1;
      const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
      px(g, x, y, `rgb(${Math.round((nx * .5 + .5) * 255)},${Math.round((ny * .5 + .5) * 255)},${Math.round((nz * .5 + .5) * 255)})`);
    } }, false);
  return { map, normal };
}

/** Flache, beleuchtbare Fläche mit Fußpunkt unten; wirft Schatten entlang der Silhouette */
export function spriteMesh(scene, tex, w, h) {
  const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0);
  const mat = new THREE.MeshStandardMaterial({ map: tex.map, normalMap: tex.normal, alphaTest: .5, side: THREE.DoubleSide,
    roughness: .85, metalness: 0, emissive: new THREE.Color('#FFFFFF'), emissiveIntensity: 0 });
  const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex.map, alphaTest: .5 });
  scene.add(mesh); return { mesh, mat, tex };
}

/** Probekreatur (links) und Wildschleim (rechts) */
export function createSprites(scene) {
  const creature = spriteMesh(scene, spriteTextures(CREATURE, creatureColors(PALETTES.fire)), 1.7, 1.7);
  const enemy = spriteMesh(scene, spriteTextures(SLIME, SLIME_COLORS), 1.5, 1.07);
  const CR_BASE = new THREE.Vector3(-2.3, 0, 0.6), EN_BASE = new THREE.Vector3(2.4, 0, 0.4);
  creature.mesh.position.copy(CR_BASE); enemy.mesh.position.copy(EN_BASE);
  let normalsOn = true;

  return {
    creature, enemy, CR_BASE, EN_BASE,
    setElement(id) {
      const old = creature.tex; const t = spriteTextures(CREATURE, creatureColors(PALETTES[id]));
      creature.tex = t; creature.mat.map = t.map; creature.mat.normalMap = normalsOn ? t.normal : null; creature.mat.needsUpdate = true;
      creature.mesh.customDepthMaterial.map = t.map; creature.mesh.customDepthMaterial.needsUpdate = true;
      old.map.dispose(); old.normal.dispose();
    },
    setNormals(on) {
      normalsOn = on;
      [creature, enemy].forEach((s) => { const want = on ? s.tex.normal : null; if (s.mat.normalMap !== want) { s.mat.normalMap = want; s.mat.needsUpdate = true; } });
    },
    /** Posen aus der Kampflogik auf die Meshes übertragen */
    applyPoses({ cr, en }) {
      creature.mesh.position.set(CR_BASE.x + cr.x, cr.y, CR_BASE.z); creature.mesh.scale.set(cr.sx, cr.sy, 1);
      creature.mat.emissiveIntensity = cr.flash * 1.4;
      enemy.mesh.visible = en.visible;
      enemy.mesh.position.set(EN_BASE.x + en.x, en.y, EN_BASE.z); enemy.mesh.scale.set(en.sx, en.sy, 1);
      enemy.mat.emissiveIntensity = en.flash * 1.6;
    },
    /** Billboards drehen sich zur Kamera (nur um die Hochachse) */
    faceCamera(camera) {
      [creature.mesh, enemy.mesh].forEach((m) => { m.rotation.y = Math.atan2(camera.position.x - m.position.x, camera.position.z - m.position.z); });
    }
  };
}
