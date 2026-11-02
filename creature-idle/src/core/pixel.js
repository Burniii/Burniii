// Helfer für prozedurale Pixel-Grafik: deterministischer Zufall und Canvas-Texturen.
import * as THREE from 'three';

// Mulberry32: gleicher Seed → gleiche Folge (Texturen und Gelände sehen immer gleich aus)
export function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Zeichnet in ein Canvas und liefert eine pixelscharfe Textur (NearestFilter, ohne Mipmaps)
export function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  return t;
}

export function px(g, x, y, col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }

// Gewichtete Farbwahl: list = [[farbe, gewicht], …]
export function shade(r, list) {
  const v = r(); let acc = 0;
  for (const [c, w] of list) { acc += w; if (v < acc) return c; }
  return list[list.length - 1][0];
}
