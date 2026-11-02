// Kampflogik und Kampf-Animationen als reine Zustandsmaschine – kein three.js, kein DOM.
// Die Logik liefert Posen (Versatz, Skalierung, Aufblitzen); sprites.js überträgt sie auf die Meshes.
// Visuelle/akustische Folgen laufen über Callbacks (onHit, onHurt, onRespawn).

export const ENEMY_MAX_HP = 100;

const easeBack = (p) => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };

/** Schaden 14–26, 15 % Krit (×2) */
export function rollDamage(random = Math.random) {
  const crit = random() < .15;
  const dmg = (14 + Math.floor(random() * 13)) * (crit ? 2 : 1);
  return { dmg, crit };
}

export function createCombat({ onHit = () => {}, onHurt = () => {}, onRespawn = () => {} } = {}) {
  const cr = { state: 'idle', t: 0, hitDone: false };
  const en = { state: 'idle', t: 0, hp: ENEMY_MAX_HP };

  function enemyHit() {
    const { dmg, crit } = rollDamage();
    en.hp = Math.max(0, en.hp - dmg);
    onHit({ dmg, crit, hp: en.hp });
    en.state = en.hp <= 0 ? 'down' : 'hit'; en.t = 0;
  }

  return {
    get enemyHp() { return en.hp; },
    /** Angriff nur aus dem Ruhezustand und solange der Gegner da ist */
    attack() { if (cr.state !== 'idle' || !(en.state === 'idle' || en.state === 'hit')) return false; cr.state = 'attack'; cr.t = 0; cr.hitDone = false; return true; },
    hurt() { if (cr.state !== 'idle') return false; cr.state = 'hit'; cr.t = 0; onHurt(); return true; },

    /** Zeit fortschreiben und aktuelle Posen liefern */
    update(dt, time) {
      // Kreatur
      cr.t += dt; let cx = 0, cy = 0, sx = 1, sy = 1, flash = 0;
      if (cr.state === 'idle') { const st = Math.floor(time * 2.4) % 2; cy = st * .07; sx = st ? .98 : 1.03; sy = st ? 1.02 : .97; }
      else if (cr.state === 'attack') {
        // 0,6 s: Ausholen (−0,3) → Vorstoß → Treffer bei 48 % → Rückkehr
        const p = Math.min(1, cr.t / .6);
        if (p < .22) cx = -.3 * (p / .22); else if (p < .5) cx = -.3 + 3.9 * ((p - .22) / .28); else cx = 3.6 * (1 - (p - .5) / .5);
        sx = p > .22 && p < .5 ? 1.08 : 1; sy = 2 - sx;
        if (!cr.hitDone && p >= .48) { cr.hitDone = true; enemyHit(); }
        if (p >= 1) cr.state = 'idle';
      } else if (cr.state === 'hit') {
        // 0,45 s: Schütteln + weißes Aufblitzen
        const p = Math.min(1, cr.t / .45); cx = Math.sin(p * Math.PI * 6) * .18 * (1 - p); flash = p < .5 ? 1 - p * 2 : 0;
        if (p >= 1) cr.state = 'idle';
      }

      // Gegner
      en.t += dt; let ex = 0, ey = 0, es = 1, esy = 1, ef = 0, visible = true;
      if (en.state === 'idle') { const st = Math.floor(time * 1.6) % 2; ey = st * .05; esy = st ? 1.04 : .96; }
      else if (en.state === 'hit') { const p = Math.min(1, en.t / .35); ex = Math.sin(p * Math.PI * 5) * .15 * (1 - p); ef = 1 - p; if (p >= 1) en.state = 'idle'; }
      else if (en.state === 'down') { const p = Math.min(1, en.t / .9); visible = Math.floor(p * 12) % 2 === 0; esy = 1 - p * .6; es = 1 + p * .3; ef = p < .3 ? 1 : 0; if (p >= 1) { en.state = 'gone'; en.t = 0; } }
      else if (en.state === 'gone') { visible = false; if (en.t > .6) { en.state = 'spawn'; en.t = 0; en.hp = ENEMY_MAX_HP; onRespawn({ hp: en.hp }); } }
      else if (en.state === 'spawn') { const p = Math.min(1, en.t / .5); es = esy = Math.max(.001, easeBack(p)); if (p >= 1) en.state = 'idle'; }

      return {
        cr: { x: cx, y: cy, sx, sy, flash },
        en: { x: ex, y: ey, sx: es, sy: esy, flash: ef, visible }
      };
    }
  };
}
