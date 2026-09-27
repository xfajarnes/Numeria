// ─────────────────────────────────────────────────────────────
// ESCENA DE JOC · món, moviment, interaccions i punts de control
// ─────────────────────────────────────────────────────────────
import { CASELLA as T, E, PULS_S, ILLES, num } from './art/paleta.js';
import { ORIGENS } from './art/peces.js';
import { AMPLE, ALT, TERRA, SOLID_TERRA, OBJECTES, INTERACCIONS, INICI } from './mon/equatia.js';
import { estat, aplicarRegistres } from './estat.js';
import { mostrarDialeg, existeix } from './dialegs.js';
import { obrirRepte } from './reptes/motor.js';
import { afegirRegistres, puntDeControl } from './xarxa.js';
import { CONFIG } from './config.js';
import { Controls } from './controls.js';
import { hud } from './hud.js';

const VELOCITAT = 110 * E;                 // px del món per segon
const RADI_INTERACCIO = 1.35 * T;
const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

export class Joc extends Phaser.Scene {
  constructor() { super('Joc'); }

  create() {
    const P = ILLES.algerba;
    this.pausa = false;
    this.cameras.main.setBackgroundColor(P.fosc);

    // ── Terra: tot en una sola textura, excepte l'aigua, que es mou ──
    const rt = this.add.renderTexture(0, 0, AMPLE * T, ALT * T).setOrigin(0).setDepth(-100);
    this.aigues = [];
    rt.beginDraw();
    const TEX = { '.': 'sorra', ',': 'emped', t: 'rajola', '"': 'herba', '^': 'roca', '=': 'moll' };
    for (let y = 0; y < ALT; y++) for (let x = 0; x < AMPLE; x++) {
      const c = TERRA[y][x], h = hash(x, y);
      if (c === '~' || c === 'w') {
        const base = c === '~' ? 'aigua' : 'costa';
        this.aigues.push(this.add.image(x * T, y * T, `${base}-${h % 2}`).setOrigin(0).setDepth(-99).setData('base', base));
      } else {
        let k = TEX[c];
        if (k === 'sorra' || k === 'emped') k += '-' + (h % 3);
        if (k === 'rajola') k += '-' + ((x + y) % 2);
        rt.batchDraw(k, x * T, y * T);
      }
    }
    rt.endDraw();
    this.time.addEvent({ delay: 800, loop: true, callback: () => this.aigues.forEach((a) => a.setTexture(`${a.getData('base')}-${a.texture.key.endsWith('0') ? 1 : 0}`)) });

    // ── Graella de col·lisions ──
    this.solid = TERRA.map((fila) => [...fila].map((c) => SOLID_TERRA.has(c)));

    // ── Objectes ──
    for (const [clau, x, y, w, h] of OBJECTES) {
      const o = ORIGENS[clau] || [0.5, 1];
      const px = (x + w / 2) * T, py = (y + h) * T;
      this.add.image(px, py, clau).setOrigin(o[0], o[1]).setDepth(py);
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.solid[j]) this.solid[j][i] = true;
      if (clau === 'fanal') this.llum('ambre', px, py - 66 * E, 0.55, 0.5);
      if (clau === 'balanca' || clau === 'vaixell') { /* sense llum */ }
    }
    // el moll és transitable encara que estigui sobre l'aigua
    for (let y = 0; y < ALT; y++) for (let x = 0; x < AMPLE; x++) if (TERRA[y][x] === '=') this.solid[y][x] = false;

    // ── Punts d'interacció i NPC ──
    this.punts = INTERACCIONS.map((d) => {
      const px = d.x * T + (d.tipus === 'npc' ? T / 2 : 0), py = d.y * T + (d.tipus === 'npc' ? T * 0.85 : 0);
      const p = { ...d, px, py };
      if (d.tipus === 'npc') {
        const o = ORIGENS['npc-' + d.id];
        p.sprite = this.add.image(px, py, 'npc-' + d.id).setOrigin(o[0], o[1]).setDepth(py);
        p.fase = Math.random() * 6;
        this.solid[Math.floor(py / T)][Math.floor(px / T)] = true;
        p.alcadaMarca = 58 * E;
      } else p.alcadaMarca = d.id === 'tomba' ? 92 * E : d.id === 'segell' ? 40 * E : 40 * E;
      if (d.llum === 'cian') { p.halo = this.llum('cian', px, py - 40 * E, 1.1, 0.5); this.llum('violeta', px + 8 * E, py - 22 * E, 0.35, 0.6); }
      return p;
    });
    this.marca = this.add.image(0, 0, 'rombe').setDepth(1e6).setVisible(false);

    // ── Protagonista ──
    const pos = estat.partida.pos || { x: INICI.x * T, y: INICI.y * T };
    this.jug = { x: pos.x, y: pos.y, vista: 'davant', flip: false, t: 0, caminant: false };
    this.spriteJug = this.add.image(pos.x, pos.y, this.texJug()).setDepth(pos.y);
    this.aplicarOrigen();

    // ── Càmera i llum ambient del dia (tint 8 % en mode pantalla, 07 §4.1) ──
    const cam = this.cameras.main;
    cam.setBounds(0, 0, AMPLE * T, ALT * T);
    cam.startFollow(this.spriteJug, true, 0.12, 0.12);
    const [tc, ta] = P.tintDia;
    this.tint = this.add.rectangle(0, 0, 10, 10, num(tc), ta).setOrigin(0.5).setScrollFactor(0).setDepth(2e6).setBlendMode(Phaser.BlendModes.SCREEN);
    this.ajustarVista();
    this.scale.on('resize', () => this.ajustarVista());

    // ── Controls ──
    this.controls = new Controls(this, () => this.interactuar());
    hud.mostrar();
    hud.actualitzar();
    hud.onAccio = () => this.interactuar();
    hud.onPausa = (si) => this.pausar(si);

    // desat local periòdic de la posició
    this.time.addEvent({ delay: 15000, loop: true, callback: () => { this.desarPosicio(); } });

    if (!estat.partida.introVista) {
      this.time.delayedCall(300, async () => {
        this.pausar(true);
        await mostrarDialeg('inici', { nom: estat.partida.nom });
        estat.partida.introVista = true;
        this.pausar(false);
      });
    }
  }

  llum(color, x, y, escala, alfa) {
    return this.add.image(x, y, 'halo-' + color).setBlendMode(Phaser.BlendModes.ADD).setScale(escala).setAlpha(alfa).setDepth(y + 2000);
  }

  texJug() { return `jug-${estat.partida.base}-${this.jug.vista}`; }
  aplicarOrigen() { const o = ORIGENS[this.texJug()]; this.spriteJug.setOrigin(o[0], o[1]); }

  ajustarVista() {
    const w = this.scale.width, h = this.scale.height;
    const caselles = w > 900 ? 19 : 11;
    let zoom = Math.min(w / (T * caselles), h / (T * 7));
    zoom = Math.max(0.45, Math.min(1.4, zoom));
    this.cameras.main.setZoom(zoom);
    this.tint.setSize(w, h).setDisplaySize(w / zoom + 4, h / zoom + 4).setPosition(w / 2, h / 2);
  }

  pausar(si) {
    this.pausa = si;
    this.controls.pausar(si);
    hud.pausar(si);
  }

  lliure(x, y) {
    const hw = 6 * E, hh = 3 * E;
    for (const [cx, cy] of [[x - hw, y - hh], [x + hw, y - hh], [x - hw, y + hh / 2], [x + hw, y + hh / 2]]) {
      const tx = Math.floor(cx / T), ty = Math.floor(cy / T);
      if (tx < 0 || ty < 0 || tx >= AMPLE || ty >= ALT) return false;
      if (this.solid[ty][tx]) return false;
    }
    return true;
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    const j = this.jug;
    const [vx, vy] = this.pausa ? [0, 0] : this.controls.vector();
    j.caminant = Math.hypot(vx, vy) > 0.15;
    if (j.caminant) {
      const nx = j.x + vx * VELOCITAT * dt, ny = j.y + vy * VELOCITAT * dt;
      if (this.lliure(nx, j.y)) j.x = nx;
      if (this.lliure(j.x, ny)) j.y = ny;
      const vista = Math.abs(vx) > Math.abs(vy) ? 'perfil' : vy < 0 ? 'darrere' : 'davant';
      if (vista !== j.vista) { j.vista = vista; this.spriteJug.setTexture(this.texJug()); this.aplicarOrigen(); }
      if (vista === 'perfil') this.spriteJug.setFlipX(vx < 0);
      else this.spriteJug.setFlipX(false);
    }
    // Animació sense fotogrames (07 §6): bot en caminar, balanceig en repòs
    j.t += dt;
    let bot = 0, angle = 0;
    if (j.caminant) bot = -Math.abs(Math.sin((j.t * Math.PI) / 0.32)) * 2 * E;
    else { angle = Math.sin((j.t * 2 * Math.PI) / 2.4) * 1.2; bot = -Math.max(0, Math.sin((j.t * 2 * Math.PI) / 2.4)) * E * 0.5; }
    if (this.salt) { bot -= this.salt; this.salt = this.salt > 0.5 ? this.salt * 0.9 : 0; }
    this.spriteJug.setPosition(j.x, j.y + bot).setAngle(angle).setDepth(j.y);

    // NPC: balanceig suau
    for (const p of this.punts) if (p.sprite) p.sprite.setAngle(Math.sin(((time / 1000 + p.fase) * 2 * Math.PI) / 2.4) * 1.5);
    // Llum cian dels punts de repte: pols de 2,4 s
    const puls = 0.5 + 0.5 * Math.sin((time / 1000) * 2 * Math.PI / PULS_S);
    for (const p of this.punts) if (p.halo) p.halo.setAlpha(0.3 + 0.35 * puls);

    // Punt d'interacció més proper
    let proper = null, dmin = RADI_INTERACCIO;
    for (const p of this.punts) { const d = Math.hypot(p.px - j.x, p.py - j.y); if (d < dmin) { dmin = d; proper = p; } }
    this.proper = this.pausa ? null : proper;
    if (this.proper) {
      this.marca.setVisible(true).setPosition(proper.px, proper.py - proper.alcadaMarca + Math.sin(time / 180) * 2 * E).setAlpha(0.65 + 0.35 * puls);
      hud.proper(proper.tipus === 'npc' ? 'Parlar' : 'Mirar');
    } else { this.marca.setVisible(false); hud.proper(null); }
  }

  async interactuar() {
    const p = this.proper;
    if (!p || this.pausa) return;
    this.pausar(true);
    if (p.sprite) this.tweens.add({ targets: p.sprite, y: p.py - 3 * E, duration: 90, yoyo: true });
    const fet = (estat.partida.reptes[p.repte]?.encerts || 0) > 0;
    const bloc = fet && existeix(p.dialeg + '.fet') ? p.dialeg + '.fet' : p.dialeg;
    const vol = await mostrarDialeg(bloc, { nom: estat.partida.nom });
    if (vol && p.repte) {
      const { registres } = await obrirRepte(p.repte, { nivell: estat.nivell, itinerari: estat.itinerari });
      if (registres.length) {
        aplicarRegistres(registres, CONFIG.CORONES_PER_REPTE);
        afegirRegistres(registres);
        this.desarPosicio();
        puntDeControl();                          // punt de control: partida + telemetria
        hud.actualitzar();
        if (registres.some((r) => r.encert)) this.celebrar();
      }
    }
    this.pausar(false);
  }

  celebrar() { this.salt = 4 * E; }               // salt de 4 px en encertar (07 §6)

  desarPosicio() {
    estat.partida.pos = { x: Math.round(this.jug.x), y: Math.round(this.jug.y) };
    estat.partida.actualitzat = Date.now();
    try { localStorage.setItem('numeria.partida.' + (estat.alumne ? estat.alumne.codi : 'convidat'), JSON.stringify(estat.partida)); } catch {}
  }
}
