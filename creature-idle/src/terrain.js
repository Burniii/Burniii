// Arena „Waldruine“: prozedurale 16×16-Texturen, Gelände aus Regeln, Requisiten, Fackeln, Kristalle.
import * as THREE from 'three';
import { rng, canvasTex, px, shade } from './core/pixel.js';

const DIRT = [['#8A5A3B', .55], ['#7A4E33', .3], ['#9B6844', .11], ['#6E6A66', .04]];

function makeTextures() {
  const grassTop = canvasTex(16, 16, (g) => { const r = rng(11);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(g, x, y, shade(r, [['#5DA34A', .5], ['#4E9140', .28], ['#6FB957', .16], ['#86CC66', .06]])); });
  const grassSide = canvasTex(16, 16, (g) => { const r = rng(12);
    for (let x = 0; x < 16; x++) { const gh = 2 + Math.floor(r() * 3);
      for (let y = 0; y < 16; y++) {
        let c; if (y < gh) c = r() < .6 ? '#5DA34A' : '#4E9140'; else if (y === gh) c = '#3F7A36';
        else c = shade(r, DIRT);
        px(g, x, y, c); } } });
  const dirt = canvasTex(16, 16, (g) => { const r = rng(13);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(g, x, y, shade(r, DIRT)); });
  const path = canvasTex(16, 16, (g) => { const r = rng(15);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(g, x, y, shade(r, [['#C9A26B', .5], ['#B98F5A', .3], ['#D6B47C', .15], ['#9E7A4C', .05]])); });
  const stone = canvasTex(16, 16, (g) => { const r = rng(14);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const row = Math.floor(y / 4), off = (row % 2) * 4;
      const mortar = (y % 4 === 3) || ((x + off) % 8 === 7);
      let c = mortar ? '#55525C' : shade(r, [['#8D8A93', .5], ['#7B7882', .3], ['#9C99A3', .2]]);
      if (!mortar && r() < .07) c = '#5E8E46'; // Moos
      px(g, x, y, c); } });
  const bark = canvasTex(16, 16, (g) => { const r = rng(16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(g, x, y, (x % 4 === 0) ? '#4A3020' : shade(r, [['#6B4A30', .6], ['#5A3D27', .3], ['#7E5A3A', .1]])); });
  const leaf = canvasTex(16, 16, (g) => { const r = rng(17);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) px(g, x, y, shade(r, [['#3F8A3A', .45], ['#2F6E2E', .3], ['#56A84A', .18], ['#7CC560', .07]])); });
  return { grassTop, grassSide, dirt, path, stone, bark, leaf };
}

/** Baut die komplette Arena in die Szene. Liefert Höhenabfrage, Fackeln und Kristall-Material. */
export function createTerrain(scene) {
  const T = makeTextures();
  const M = (map) => new THREE.MeshStandardMaterial({ map, roughness: 1, metalness: 0 });
  // Würfelseiten-Reihenfolge: +x, −x, +y (oben), −y, +z, −z
  const grassMats = [M(T.grassSide), M(T.grassSide), M(T.grassTop), M(T.dirt), M(T.grassSide), M(T.grassSide)];
  const pathMats = [M(T.dirt), M(T.dirt), M(T.path), M(T.dirt), M(T.dirt), M(T.dirt)];
  const dirtMat = M(T.dirt), stoneMat = M(T.stone), barkMat = M(T.bark), leafMat = M(T.leaf);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);

  /* Gelände aus Regeln: hinten Terrassen, vorne der Kampfweg mit ausgefransten Rändern */
  const heights = new Map();
  const grassPos = [], pathPos = [], dirtPos = [], stonePos = [];
  const R = rng(5);
  for (let x = -10; x <= 10; x++) for (let z = -7; z <= 5; z++) {
    let h = 0;
    if (z <= -3) h = 1 + (z <= -5 ? 1 : 0) + (R() < .3 ? 1 : 0);
    heights.set(x + ',' + z, h);
    const edge = Math.abs(x) === 5 || z === -2 || z === 2;
    const isPath = h === 0 && Math.abs(x) <= 5 && z >= -2 && z <= 2 && !(edge && R() < .45);
    (isPath ? pathPos : grassPos).push([x, h - 0.5, z]);
    for (let y = h - 1; y >= 0; y--) dirtPos.push([x, y - 0.5, z]);
  }
  const hAt = (x, z) => heights.get(Math.round(x) + ',' + Math.round(z)) || 0;

  // Steinsäulen und Bogen
  const pillar = (x, z, n) => { const b = hAt(x, z); for (let i = 0; i < n; i++) stonePos.push([x, b + i + 0.5, z]); };
  pillar(-5, -2, 3); pillar(-6, -2, 1); pillar(4, -2, 3); pillar(6, -2, 3);
  stonePos.push([5, 2.5, -2]); stonePos.push([7, 0.5, -1]);

  const inst = (list, mats) => {
    const m = new THREE.InstancedMesh(boxGeo, mats, list.length);
    const o = new THREE.Object3D();
    list.forEach((p, i) => { o.position.set(p[0], p[1], p[2]); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
    m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
  };
  inst(grassPos, grassMats); inst(pathPos, pathMats); inst(dirtPos, dirtMat); inst(stonePos, stoneMat);

  const rubble = (x, z, s, rot) => {
    const m = new THREE.Mesh(boxGeo, stoneMat); m.scale.set(s, s * .7, s);
    m.position.set(x, hAt(x, z) + s * .35, z); m.rotation.y = rot; m.castShadow = m.receiveShadow = true; scene.add(m);
  };
  rubble(-4.2, -1.7, .45, .4); rubble(3.2, -1.6, .35, -.3); rubble(5.6, -0.8, .5, .8);

  const tree = (x, z) => {
    const b = hAt(x, z);
    const trunk = new THREE.Mesh(boxGeo, barkMat); trunk.scale.set(.35, 1.5, .35); trunk.position.set(x, b + .75, z);
    trunk.castShadow = trunk.receiveShadow = true; scene.add(trunk);
    [[0, 1.9, 0, 1.2], [.5, 1.5, .25, .85], [-.45, 1.6, -.2, .9], [.1, 2.5, -.1, .7]].forEach(([dx, dy, dz, s]) => {
      const l = new THREE.Mesh(boxGeo, leafMat); l.scale.setScalar(s); l.position.set(x + dx, b + dy, z + dz);
      l.castShadow = l.receiveShadow = true; scene.add(l); });
  };
  tree(-7.6, -3.6); tree(7.4, -4.2); tree(-8.3, 1.2); tree(8.2, 0.6); tree(-2.5, -5.2);

  // Büsche im Vordergrund (werden durch Tilt-Shift unscharf)
  const bush = (x, z, s) => { const l = new THREE.Mesh(boxGeo, leafMat); l.scale.setScalar(s); l.position.set(x, s / 2, z); l.castShadow = l.receiveShadow = true; scene.add(l); };
  bush(-4.6, 3.4, .75); bush(-3.9, 3.9, .5); bush(4.3, 3.6, .65); bush(-6.5, 2.4, .6);

  /* Fackeln mit flackerndem Punktlicht */
  const torches = [];
  const torch = (x, z) => {
    const post = new THREE.Mesh(boxGeo, barkMat); post.scale.set(.14, 1.1, .14); post.position.set(x, .55, z);
    post.castShadow = true; scene.add(post);
    const flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#FFB347').multiplyScalar(3) });
    const flame = new THREE.Mesh(boxGeo, flameMat); flame.scale.setScalar(.2); flame.position.set(x, 1.2, z); scene.add(flame);
    const light = new THREE.PointLight('#FF9A3C', 2, 7, 1.6); light.position.set(x, 1.35, z + .15); scene.add(light);
    torches.push({ light, flame, seed: Math.random() * 10 });
  };
  torch(-3.6, -1.5); torch(3.5, -1.5);

  /* Kristalle (emissiv, leuchten durch Bloom) */
  const crystalMat = new THREE.MeshStandardMaterial({ color: '#7FE7FF', emissive: '#3CC8FF', emissiveIntensity: .4, flatShading: true, roughness: .3 });
  [[5.2, -3.6, 1], [5.6, -3.3, .7], [4.8, -3.2, .55]].forEach(([x, z, s]) => {
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(.35), crystalMat); c.scale.set(s, s * 1.9, s);
    c.position.set(x, hAt(x, z) + .3 * s * 1.9, z); c.rotation.y = x; c.castShadow = true; scene.add(c); });

  let torchBase = 2.2;
  return {
    hAt,
    /** Tageszeit: Fackel-Grundhelligkeit und Kristall-Leuchten */
    setTime(t) { torchBase = t.torch; crystalMat.emissiveIntensity = t.crystal; },
    setLightsVisible(on) { torches.forEach((t) => { t.light.visible = on; }); },
    update(time) {
      torches.forEach((t) => {
        const f = .85 + .15 * Math.sin(time * 9 + t.seed) + .08 * Math.sin(time * 23 + t.seed * 2);
        t.light.intensity = torchBase * f * 2.5; t.flame.scale.setScalar(.2 * (.9 + .15 * f));
      });
    }
  };
}
