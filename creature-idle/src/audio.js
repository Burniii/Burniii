// Soundeffekte. Platzhalter: Die Diorama-Probe hatte noch keinen Ton.
// In Schritt 3 kommen hier ZzFX-Effekte je Element (Angriff, Treffer, Aura) mit leichter Zufallsvariation hinein.

export function createAudio() {
  return {
    /** Spielt einen benannten Effekt, z. B. play('hit', { element: 'fire', crit: true }) */
    play(_name, _opts = {}) {}
  };
}
