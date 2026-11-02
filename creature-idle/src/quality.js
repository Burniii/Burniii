// Qualitätsstufen und einzeln schaltbare Effekte. Nur Zustand – Anwenden übernimmt main.js.

export const QUALITY = {
  low:  { scale: .5,  shadow: 512 },
  mid:  { scale: .75, shadow: 1024 },
  high: { scale: Math.min(window.devicePixelRatio || 1, 2), shadow: 2048 }
};

export const FX_KEYS = ['shadows', 'lights', 'bloom', 'tilt', 'atmo', 'vignette'];

export function createQualityState() {
  const fx = Object.fromEntries(FX_KEYS.map((k) => [k, true]));
  return {
    fx,
    level: 'mid',
    compare: false, // „Ohne alle Effekte vergleichen“
    get preset() { return QUALITY[this.level]; },
    /** Tatsächlich aktive Effekte (im Vergleichsmodus alle aus) */
    effective() {
      if (!this.compare) return fx;
      const off = {}; for (const k in fx) off[k] = false; return off;
    },
    toggle(key) { fx[key] = !fx[key]; }
  };
}
