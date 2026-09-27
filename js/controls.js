// ─────────────────────────────────────────────────────────────
// CONTROLS · teclat (PC) i joystick virtual (mòbil), 04 §5 i 01 §6
// ─────────────────────────────────────────────────────────────
import { esTactil } from './reptes/teclat.js';

export class Controls {
  constructor(escena, interactuar) {
    this.escena = escena;
    const kb = escena.input.keyboard;
    this.tecles = kb.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,E,SPACE,ENTER');
    kb.on('keydown', (ev) => {
      if (this.aturat) return;
      if (['e', 'E', ' ', 'Enter'].includes(ev.key)) interactuar();
    });
    this.joy = { x: 0, y: 0 };
    this.muntarJoystick();
  }

  // Quan hi ha un diàleg o un repte obert, el teclat és per a la interfície i no per al joc.
  pausar(si) {
    this.aturat = si;
    const kb = this.escena.input.keyboard;
    kb.enabled = !si;
    if (si) { kb.disableGlobalCapture(); kb.resetKeys(); this.joy.x = this.joy.y = 0; this.centrarPom(); }
    else kb.enableGlobalCapture();
  }

  vector() {
    const t = this.tecles;
    let x = (t.RIGHT.isDown || t.D.isDown ? 1 : 0) - (t.LEFT.isDown || t.A.isDown ? 1 : 0);
    let y = (t.DOWN.isDown || t.S.isDown ? 1 : 0) - (t.UP.isDown || t.W.isDown ? 1 : 0);
    if (!x && !y) { x = this.joy.x; y = this.joy.y; }
    const m = Math.hypot(x, y);
    return m > 1 ? [x / m, y / m] : [x, y];
  }

  muntarJoystick() {
    const base = document.getElementById('joystick');
    if (!esTactil()) { base.hidden = true; return; }
    base.hidden = false;
    const pom = base.querySelector('.pom');
    this.centrarPom = () => { pom.style.transform = 'translate(-50%, -50%)'; };
    let id = null, cx = 0, cy = 0;
    const R = 52;
    const moure = (e) => {
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const m = Math.hypot(dx, dy);
      if (m > R) { dx = (dx / m) * R; dy = (dy / m) * R; }
      pom.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      const f = Math.min(1, m / R);
      this.joy.x = f < 0.2 ? 0 : (dx / R);
      this.joy.y = f < 0.2 ? 0 : (dy / R);
    };
    base.addEventListener('pointerdown', (e) => {
      if (this.aturat) return;
      id = e.pointerId; base.setPointerCapture(id);
      const r = base.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      moure(e);
    });
    base.addEventListener('pointermove', (e) => { if (e.pointerId === id) moure(e); });
    const deixar = (e) => { if (e.pointerId !== id) return; id = null; this.joy.x = this.joy.y = 0; this.centrarPom(); };
    base.addEventListener('pointerup', deixar);
    base.addEventListener('pointercancel', deixar);
  }
  centrarPom() {}
}
