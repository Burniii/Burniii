// Kreaturen- und Gegnerdaten aus den Stilproben / der Diorama-Probe.
// Pixel-Raster: jeweils die linke Hälfte; mirror() ergänzt die rechte Hälfte spiegelbildlich.

export const OUTLINE = '#1A1F2C';

export const PALETTES = {
  fire:  { label: 'Feuer',   name: 'Glutling',   body: '#F28C38', dark: '#B8461A', light: '#FFD39A', accent: '#FFD25E' },
  water: { label: 'Wasser',  name: 'Tropfling',  body: '#4AA3DF', dark: '#235E9C', light: '#C4E8FA', accent: '#8FE0E8' },
  plant: { label: 'Pflanze', name: 'Sprössling', body: '#6CC24A', dark: '#347A28', light: '#D6F1B8', accent: '#F6E27A' }
};

// Zeichen: . transparent, o Kontur, b body, l light, d dark, a accent, w weiß, k Pupille
export const CREATURE_HALF = [
  '.oo.....', '.oao....', '.oaao...', '..oaoooo',
  '.obllbbb', '.oblbbbb', 'obbwwkbb', 'obbwkkbb',
  'obbbbbbb', 'obabbbbo', 'odbbbbbb', '.odbbbbb',
  '.oddbbbb', '..oddddd', '..oddooo', '...oo...'
];

// Wildschleim: p Körper, q Schatten, h Highlight, k Augen/Brauen
export const SLIME_HALF = [
  '....ooo', '...oppp', '..ohppp', '.ohpkpp', '.opkkpp',
  'oppkkpp', 'oqppppp', 'oqqpppp', 'oqqqqqq', '.oooooo'
];
export const SLIME_COLORS = { o: OUTLINE, p: '#8A63C4', q: '#5E4387', h: '#C3A8EE', k: OUTLINE };

export const mirror = (half) => half.map((r) => r + r.split('').reverse().join(''));

export const creatureColors = (p) => ({ o: OUTLINE, k: OUTLINE, w: '#FFFFFF', b: p.body, l: p.light, d: p.dark, a: p.accent });

// Höhenfeld für automatische Normal-Maps: Chebyshev-Abstand zum Rand (max. 5)
export function heightField(rows) {
  const H = rows.length, W = rows[0].length;
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H && rows[y][x] !== '.';
  const hs = [];
  for (let y = 0; y < H; y++) {
    hs.push([]);
    for (let x = 0; x < W; x++) {
      let d = 0;
      if (inside(x, y)) {
        d = 5;
        outer: for (let k = 1; k <= 4; k++) for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue;
          if (!inside(x + dx, y + dy)) { d = k; break outer; }
        }
      }
      hs[y].push(d);
    }
  }
  return hs;
}
