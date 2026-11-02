// HTML-Oberfläche über dem 3D-Canvas: HUD, Schadenszahlen, Bedienpult.
const $ = (id) => document.getElementById(id);

export function createUI() {
  const stage = $('stage'), overlay = $('overlay');

  const setPressed = (rowSel, active) =>
    document.querySelectorAll(rowSel + ' .btn').forEach((o) => o.setAttribute('aria-pressed', String(o === active)));

  return {
    stage,
    canvas: $('scene'),
    showError() { $('err').hidden = false; },
    setHp(hp) { $('hpNum').textContent = hp; $('hpFill').style.width = hp + '%'; },
    setCreature(p) { $('crName').textContent = p.name; $('crInfo').textContent = 'Lv. 5 · ' + p.label; },
    setReadout(text) { $('readout').textContent = text; },

    /** Schadenszahl an Bildschirmposition (NDC −1…1) */
    showDamage(n, crit, ndc) {
      const d = document.createElement('div'); d.className = crit ? 'dmg crit' : 'dmg'; d.textContent = '-' + n;
      d.style.left = ((ndc.x * .5 + .5) * stage.clientWidth) + 'px'; d.style.top = ((-ndc.y * .5 + .5) * stage.clientHeight) + 'px';
      overlay.appendChild(d); const kill = () => d.remove(); d.addEventListener('animationend', kill); setTimeout(kill, 1600);
    },

    /** Zustand der Effekt-Schalter anzeigen */
    renderFx(q) {
      document.querySelectorAll('#fxRow .btn').forEach((b) => { b.setAttribute('aria-pressed', String(q.fx[b.dataset.fx])); b.disabled = q.compare; });
      $('btnCompare').setAttribute('aria-pressed', String(q.compare));
      $('btnCompare').textContent = q.compare ? 'Effekte wieder einschalten' : 'Ohne alle Effekte vergleichen';
    },

    /** Bedienelemente mit Handlern verbinden */
    bind({ onAttack, onHurt, onElement, onTime, onQuality, onFxToggle, onCompare }) {
      $('btnAtk').addEventListener('click', onAttack);
      $('btnHurt').addEventListener('click', onHurt);
      document.querySelectorAll('#elRow .btn').forEach((b) => b.addEventListener('click', () => {
        onElement(b.dataset.el);
        document.querySelectorAll('#elRow .btn').forEach((o) => { const on = o === b; o.classList.toggle('on', on); o.setAttribute('aria-pressed', String(on)); });
      }));
      document.querySelectorAll('#timeRow .btn').forEach((b) => b.addEventListener('click', () => { onTime(b.dataset.time); setPressed('#timeRow', b); }));
      document.querySelectorAll('#qRow .btn').forEach((b) => b.addEventListener('click', () => { onQuality(b.dataset.q); setPressed('#qRow', b); }));
      document.querySelectorAll('#fxRow .btn').forEach((b) => b.addEventListener('click', () => onFxToggle(b.dataset.fx)));
      $('btnCompare').addEventListener('click', onCompare);
    }
  };
}
