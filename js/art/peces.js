// ─────────────────────────────────────────────────────────────
// BIBLIOTECA D'ART · PECES (07-art §5, §6, §7 i §8)
// Cada peça es dibuixa amb polígons i es desa com a textura en carregar.
// Les coordenades són "a escala 1" (1 casella = 32 px) i es multipliquen per E.
// Regles: angular per defecte; cercles només per a mecanismes; contorn exterior
// de 2 px en tinta i línies interiors d'1 px; llum des del nord-oest.
// ─────────────────────────────────────────────────────────────
import { C, ILLES, E, TRAC_EXT, TRAC_INT, OMBRA_ALFA_DIA, tons, num } from './paleta.js';

// ── Figura: acumula peces i les pinta en dues passades (silueta + color) ──
export const ORIGENS = {};   // clau de textura → [origenX, origenY] (els peus o la base)
class Figura {
  constructor(g, w, h, ox, oy) { this.g = g; this.w = w; this.h = h; this.ox = ox; this.oy = oy; this.peces = []; }
  p(x, y) { return { x: this.ox + x * E, y: this.oy + y * E }; }
  // opcions: det (detall sense silueta), traç (0 = sense línia), alfa, ombra ('llum'|'ombra')
  poly(pts, color, o = {}) { this.peces.push({ pts, color, ...o }); return this; }
  rect(x, y, w, h, color, o) { return this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], color, o); }
  cercle(x, y, r, color, o = {}) { this.peces.push({ cercle: [x, y, r], color, ...o }); return this; }
  linia(x1, y1, x2, y2, color, gruix = 1, alfa = 1) { this.peces.push({ linia: [x1, y1, x2, y2], color, gruix, alfa, det: true }); return this; }
  ombraTerra(cx, amp, alfa = OMBRA_ALFA_DIA, color = '#3b2e2e') {   // hexàgon aplanat, desplaçat (+4,+3)
    const a = amp / 2, b = amp * 0.14;
    return this.poly([[cx - a + 4, 3], [cx - a * 0.6 + 4, 3 - b], [cx + a * 0.6 + 4, 3 - b], [cx + a + 4, 3], [cx + a * 0.6 + 4, 3 + b], [cx - a * 0.6 + 4, 3 + b]], color, { det: true, traç: 0, alfa, fons: true });
  }
  pintar(clau, escena) {
    const g = this.g; g.clear();
    const pts = (pc) => pc.pts.map(([x, y]) => this.p(x, y));
    // 0 · ombres de terra
    for (const pc of this.peces.filter((q) => q.fons)) { g.fillStyle(num(pc.color), pc.alfa ?? 1); g.fillPoints(pts(pc), true); }
    // 1 · silueta: contorn exterior de 2 px
    g.lineStyle(TRAC_EXT * 2 * E, num(C.tinta), 0.85);
    for (const pc of this.peces) {
      if (pc.det || pc.fons) continue;
      if (pc.cercle) { const c = this.p(pc.cercle[0], pc.cercle[1]); g.strokeCircle(c.x, c.y, pc.cercle[2] * E); }
      else g.strokePoints(pts(pc), true, true);
    }
    // 2 · colors i línies interiors
    for (const pc of this.peces) {
      if (pc.fons) continue;
      if (pc.linia) { const [x1, y1, x2, y2] = pc.linia; const a = this.p(x1, y1), b = this.p(x2, y2); g.lineStyle(pc.gruix * E, num(pc.color), pc.alfa); g.lineBetween(a.x, a.y, b.x, b.y); continue; }
      g.fillStyle(num(pc.color), pc.alfa ?? 1);
      if (pc.cercle) { const c = this.p(pc.cercle[0], pc.cercle[1]); g.fillCircle(c.x, c.y, pc.cercle[2] * E); }
      else g.fillPoints(pts(pc), true);
      if (pc.traç !== 0 && !pc.det) {
        g.lineStyle(TRAC_INT * E, num(C.tinta), 0.55);
        if (pc.cercle) { const c = this.p(pc.cercle[0], pc.cercle[1]); g.strokeCircle(c.x, c.y, pc.cercle[2] * E); }
        else g.strokePoints(pts(pc), true, true);
      }
    }
    g.generateTexture(clau, this.w * E, this.h * E);
    ORIGENS[clau] = [this.ox / (this.w * E), this.oy / (this.h * E)];
    g.clear();
    return escena.textures.get(clau);
  }
}

// Soroll determinista (llavor) perquè les variants siguin estables.
function rng(llavor) { let s = llavor * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

// ═══════════════ TERRA (caselles de 32 × 32) ═══════════════
function caselles(esc, g, P) {
  const T = (k) => new Figura(g, 32, 32, 0, 0);
  const soroll = (f, r, color, n, mida = 2.2, alfa = 0.55) => {
    for (let i = 0; i < n; i++) {
      const x = r() * 30 + 1, y = r() * 30 + 1, s = mida * (0.6 + r() * 0.8);
      f.poly([[x, y - s * 0.5], [x + s, y - s * 0.2], [x + s * 0.6, y + s * 0.5], [x - s * 0.4, y + s * 0.3]], color, { det: true, alfa });
    }
  };
  const tSorra = tons(P.terra);
  for (let v = 0; v < 3; v++) {
    const f = T(); const r = rng(v + 1);
    f.rect(0, 0, 32, 32, P.terra, { det: true });
    soroll(f, r, tSorra.ombra, 5, 2.2, 0.45); soroll(f, r, tSorra.llum, 3, 1.8, 0.6);
    if (v === 2) f.linia(6, 20, 14, 18, tSorra.ombra, 0.8, 0.5).linia(14, 18, 22, 21, tSorra.ombra, 0.8, 0.5);  // ondulació de vent
    f.pintar('sorra-' + v, esc);
  }
  // Empedrat (carrers i moll de pedra)
  const pedraBase = P.terra, junta = tons(P.terra).ombra;
  for (let v = 0; v < 3; v++) {
    const f = T(); const r = rng(v + 11);
    f.rect(0, 0, 32, 32, junta, { det: true });
    const files = [[0, 10], [10, 11], [21, 11]];
    files.forEach(([y, h], k) => {
      let x = k % 2 ? -6 : 0;
      while (x < 32) {
        const w = 9 + Math.floor(r() * 6), to = r() < 0.3 ? tons(pedraBase).ombra : r() < 0.5 ? tons(pedraBase).llum : pedraBase;
        const x0 = Math.max(0, x + 0.8), x1 = Math.min(32, x + w - 0.8);
        if (x1 - x0 > 1.5) f.poly([[x0 + 1, y + 0.8], [x1 - 1, y + 0.8], [x1, y + 1.8], [x1, y + h - 1.8], [x1 - 1, y + h - 0.8], [x0 + 1, y + h - 0.8], [x0, y + h - 1.8], [x0, y + 1.8]], to, { det: true });
        x += w;
      }
    });
    f.pintar('emped-' + v, esc);
  }
  // Rajola de la plaça: mosaic de rombes (turquesa i paper), com un patró generat per equacions
  for (let v = 0; v < 2; v++) {
    const f = T();
    f.rect(0, 0, 32, 32, tons(P.terra).llum, { det: true });
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const cx = 8 + i * 16, cy = 8 + j * 16, par = (i + j + v) % 2 === 0;
      f.poly([[cx, cy - 7], [cx + 7, cy], [cx, cy + 7], [cx - 7, cy]], par ? P.accent : tons(P.accent).ombra, { det: true });
      f.poly([[cx, cy - 3], [cx + 3, cy], [cx, cy + 3], [cx - 3, cy]], par ? C.paper : C.safraRoba, { det: true });
    }
    f.linia(0, 0, 32, 0, tons(P.terra).ombra, 0.6, 0.5).linia(0, 0, 0, 32, tons(P.terra).ombra, 0.6, 0.5);
    f.pintar('rajola-' + v, esc);
  }
  // Aigua fonda: dos fotogrames perquè brilli
  for (let v = 0; v < 2; v++) {
    const f = T();
    f.rect(0, 0, 32, 32, C.aiguaFonda, { det: true });
    const r = rng(v + 31);
    for (let i = 0; i < 4; i++) { const x = r() * 24 + 2, y = r() * 28 + 2; f.linia(x, y + v, x + 6, y + v, C.aigua, 1.2, 0.9); }
    f.pintar('aigua-' + v, esc);
  }
  // Aigua de costa: més clara, amb la vora trencada que es mou (07 §8)
  for (let v = 0; v < 2; v++) {
    const f = T();
    f.rect(0, 0, 32, 32, C.aigua, { det: true });
    f.rect(0, 0, 32, 9, tons(C.aiguaClara).ombra, { det: true, alfa: 0.7 });
    for (let x = 0; x < 32; x += 8) f.linia(x + 1, 2 + v, x + 6, 2 + v, C.paper, 1.3, 0.85);
    const r = rng(v + 41);
    for (let i = 0; i < 3; i++) { const x = r() * 24 + 2, y = 14 + r() * 14; f.linia(x, y, x + 5, y, C.aiguaClara, 1, 0.55); }
    f.pintar('costa-' + v, esc);
  }
  // Moll de fusta
  {
    const f = T(); const tf = tons(C.fustaClara);
    f.rect(0, 0, 32, 32, C.fusta, { det: true });
    for (let x = 0; x < 32; x += 8) f.rect(x + 0.5, 0, 7, 32, x % 16 ? C.fustaClara : tf.ombra, { det: true });
    f.linia(0, 16, 32, 16, C.tinta, 0.6, 0.35);
    [[3, 4], [11, 20], [19, 8], [27, 26]].forEach(([x, y]) => f.rect(x, y, 1.2, 1.2, C.ferro, { det: true }));
    f.pintar('moll', esc);
  }
  // Herba d'oasi
  {
    const f = T(); const r = rng(51); const th = tons(P.detall);
    f.rect(0, 0, 32, 32, P.detall, { det: true });
    for (let i = 0; i < 9; i++) { const x = r() * 28 + 2, y = r() * 26 + 4; f.poly([[x, y], [x + 1.2, y - 4], [x + 2.2, y]], r() < 0.5 ? th.llum : th.ombra, { det: true }); }
    f.pintar('herba', esc);
  }
  // Roca volcànica (la serralada del nord)
  {
    const f = T(); const tr = tons(P.fosc);
    f.rect(0, 0, 32, 32, tr.ombra, { det: true });
    [[2, 4, 14], [16, 2, 13], [6, 17, 15], [21, 16, 11]].forEach(([x, y, s]) => {
      f.poly([[x, y + s * 0.4], [x + s * 0.3, y], [x + s * 0.8, y + s * 0.1], [x + s, y + s * 0.6], [x + s * 0.7, y + s], [x + s * 0.2, y + s * 0.9]], P.fosc, { det: true });
      f.poly([[x + s * 0.3, y], [x + s * 0.8, y + s * 0.1], [x + s * 0.55, y + s * 0.4], [x + s * 0.15, y + s * 0.35]], tr.llum, { det: true, alfa: 0.8 });
    });
    f.pintar('roca', esc);
  }
}

// ═══════════════ OBJECTES DEL MÓN ═══════════════
function objectes(esc, g, P) {
  const tMig = tons(P.mig);

  // Palmera angular (Al-Gerba, 07 §8) · 2 × 4 caselles de textura, origen als peus
  for (let v = 0; v < 2; v++) {
    const f = new Figura(g, 64, 128, 32 * E, 124 * E); const tf = tons(P.detall); const incl = v ? -5 : 5;
    f.ombraTerra(0, 26);
    f.poly([[-3, 0], [3, 0], [4 + incl * 0.4, -40], [2 + incl, -80], [-3 + incl, -80], [-2 + incl * 0.4, -40]], C.fusta);
    for (let y = -10; y > -78; y -= 9) f.linia(-2.5 + incl * (-y / 80), y, 3 + incl * (-y / 80), y - 2, tons(C.fusta).ombra, 1, 0.8);
    const cx = incl, cy = -82;
    const fulles = [[-30, 6], [-24, -12], [-8, -22], [10, -22], [26, -10], [30, 8], [0, 16]];
    fulles.forEach(([dx, dy], i) => {
      const mx = cx + dx * 0.5, my = cy + dy * 0.5;
      f.poly([[cx, cy], [mx - dy * 0.12, my + dx * 0.12], [cx + dx, cy + dy], [mx + dy * 0.12, my - dx * 0.12]], i % 2 ? P.detall : tf.llum);
    });
    f.poly([[cx - 4, cy + 2], [cx, cy - 3], [cx + 4, cy + 2], [cx, cy + 6]], tf.ombra, { det: true });
    [[-2, 3], [2, 4], [0, 6]].forEach(([dx, dy]) => f.rect(cx + dx - 1, cy + dy, 2.2, 2.2, C.coure, { det: true }));  // dàtils
    f.pintar('palmera-' + v, esc);
  }

  // Casa andalusina · petjada 3 × 2 caselles
  const murs = [P.mig, tons(P.terra).llum, C.paper];
  const porticons = [P.accent, C.indi, C.teula];
  murs.forEach((mur, v) => {
    const f = new Figura(g, 100, 116, 50 * E, 113 * E); const tm = tons(mur);
    f.poly([[48, -58], [54, -54], [54, 4], [-42, 4], [-46, 0], [48, 0]], P.fosc, { det: true, fons: true, alfa: 0.25 });
    f.rect(-46, -100, 92, 40, tm.llum);                       // terrat vist des de dalt
    f.rect(-46, -104, 92, 5, tm.base);                        // ampit del fons
    f.rect(-46, -62, 92, 62, mur);                            // façana
    f.rect(26, -62, 20, 62, tm.ombra, { det: true, alfa: 0.55 }); // cara d'ombra (llum del NO)
    f.rect(-48, -64, 96, 5, tm.base);                         // cornisa
    // banda de rajola turquesa amb rombes
    f.rect(-46, -52, 92, 7, P.accent, { det: true });
    for (let x = -42; x < 44; x += 8) f.poly([[x, -48.5], [x + 3, -51], [x + 6, -48.5], [x + 3, -46]], C.paper, { det: true });
    // porta d'arc de ferradura, angular
    const porta = [[-9, 0], [-9, -21], [-11, -26], [-9, -31], [-4, -35], [4, -35], [9, -31], [11, -26], [9, -21], [9, 0]];
    f.poly(porta.map(([x, y]) => [x * 1.25, y * 1.05]), P.accent);
    f.poly(porta, C.fusta);
    f.linia(0, -34, 0, 0, tons(C.fusta).ombra, 1, 0.8).rect(3, -14, 1.6, 1.6, C.llauto, { det: true });
    // finestres amb gelosia
    [-28, 28].forEach((x) => {
      f.rect(x - 7, -40, 14, 14, C.sutja);
      for (let i = 1; i < 4; i++) { f.linia(x - 7 + i * 3.5, -40, x - 7 + i * 3.5, -26, C.safraRoba, 0.8, 0.8); f.linia(x - 7, -40 + i * 3.5, x + 7, -40 + i * 3.5, C.safraRoba, 0.8, 0.8); }
      f.rect(x - 11, -41, 4, 16, porticons[v]).rect(x + 7, -41, 4, 16, porticons[v]);
    });
    // vida al terrat: roba estesa i un test amb flors
    f.linia(-34, -92, 20, -84, C.sutja, 0.7, 0.9);
    [[-28, C.teula], [-16, C.indi], [-4, C.safraRoba], [8, C.paper]].forEach(([x, col]) => f.rect(x, -91 + (x + 34) * 0.15, 7, 8, col));
    f.poly([[30, -76], [38, -76], [37, -69], [31, -69]], C.teula).cercle(34, -80, 3, C.flor, { det: true });
    f.pintar('casa-' + v, esc);
  });

  // Basar de les Fórmules · petjada 6 × 2
  {
    const f = new Figura(g, 196, 140, 98 * E, 136 * E); const mur = tons(P.terra).llum, tm = tons(mur);
    f.poly([[96, -80], [102, -76], [102, 4], [-92, 4], [-96, 0], [96, 0]], P.fosc, { det: true, fons: true, alfa: 0.25 });
    f.rect(-94, -128, 188, 44, tm.llum);
    for (let x = -88; x < 90; x += 22) f.poly([[x, -122], [x + 18, -122], [x + 14, -112], [x + 4, -112]], tm.base, { det: true, alfa: 0.7 }); // lluernes
    f.rect(-94, -86, 188, 86, mur);
    f.rect(70, -86, 24, 86, tm.ombra, { det: true, alfa: 0.5 });
    f.rect(-96, -90, 192, 6, P.mig);
    // doble banda de mosaic
    [-80, -70].forEach((y, k) => {
      f.rect(-94, y, 188, 7, k ? P.neo : P.accent, { det: true, alfa: k ? 0.85 : 1 });
      for (let x = -90; x < 92; x += 8) f.poly([[x, y + 3.5], [x + 3, y + 1], [x + 6, y + 3.5], [x + 3, y + 6]], C.paper, { det: true });
    });
    // tres arcs de ferradura amb tendals ratllats i mercaderia a dins
    [-58, 0, 58].forEach((cx, k) => {
      const arc = [[-18, 0], [-18, -38], [-21, -46], [-17, -54], [-8, -60], [8, -60], [17, -54], [21, -46], [18, -38], [18, 0]];
      f.poly(arc.map(([x, y]) => [cx + x * 1.12, y * 1.05]), P.accent);
      f.poly(arc.map(([x, y]) => [cx + x, y]), C.sutja);
      [[-12, C.teula], [-4, C.safraRoba], [4, C.indi], [12, P.accent]].forEach(([dx, col], i) => f.rect(cx + dx - 3, -14 - (i % 2) * 5, 6, 8, col, { det: true }));
      f.rect(cx - 14, -6, 28, 6, C.fustaClara, { det: true });
      for (let i = 0; i < 5; i++) f.poly([[cx - 22 + i * 9, -64], [cx - 13 + i * 9, -64], [cx - 12 + i * 9, -56], [cx - 23 + i * 9, -56]], (i + k) % 2 ? C.teula : C.paper);
    });
    f.pintar('basar', esc);
  }

  // Parada de mercat · petjada 2 × 1
  [C.teula, C.indi].forEach((col, v) => {
    const f = new Figura(g, 72, 76, 36 * E, 73 * E);
    f.ombraTerra(0, 60);
    f.rect(-31, -62, 3, 62, C.fusta).rect(28, -62, 3, 62, C.fusta);
    f.rect(-28, -18, 56, 18, C.fusta);
    f.rect(-30, -24, 60, 6, C.fustaClara);
    f.rect(-30, -18, 60, 3, tons(C.fusta).ombra, { det: true });
    // mercaderia: capses de dàtils, espècies, una balança petita
    [[-24, C.fustaClara], [-12, C.coure], [0, C.safraRoba], [12, C.teula]].forEach(([x, c]) => { f.rect(x, -30, 10, 7, c); f.rect(x + 2, -29, 6, 2, tons(c).ombra, { det: true }); });
    f.rect(22, -34, 1.6, 10, C.llauto, { det: true }).linia(18, -34, 28, -34, C.llauto, 1.2);
    for (let i = 0; i < 6; i++) f.poly([[-34 + i * 11.3, -70], [-22.7 + i * 11.3, -70], [-21 + i * 11.3, -56], [-36 + i * 11.3, -56]], i % 2 ? C.paper : col);
    f.pintar('parada-' + v, esc);
  });

  // Balança gran del mercat (trucada: no està en equilibri) · petjada 2 × 2
  {
    const f = new Figura(g, 80, 130, 40 * E, 126 * E);
    f.ombraTerra(0, 50);
    f.poly([[-20, 0], [-24, -6], [-20, -14], [20, -14], [24, -6], [20, 0]], C.pedra);
    f.rect(-3, -92, 6, 78, C.llauto).rect(1, -92, 2, 78, tons(C.llauto).ombra, { det: true });
    f.poly([[-30, -96], [30, -86], [30, -82], [-30, -92]], C.llauto);
    f.cercle(0, -91, 5, C.coure);                                   // pivot: mecanisme, pot ser cercle
    f.linia(-28, -93, -32, -64, C.ferro, 0.8).linia(-28, -93, -20, -64, C.ferro, 0.8);
    f.linia(28, -84, 24, -52, C.ferro, 0.8).linia(28, -84, 32, -52, C.ferro, 0.8);
    f.poly([[-36, -64], [-16, -64], [-20, -59], [-32, -59]], C.coure);
    f.poly([[20, -52], [40, -52], [36, -47], [24, -47]], C.coure);
    f.rect(-30, -70, 8, 6, C.ferro).rect(28, -58, 6, 6, C.ferro);  // peses
    f.pintar('balanca', esc);
  }

  // Tomba de Diofant · petjada 2 × 2
  {
    const f = new Figura(g, 72, 104, 36 * E, 100 * E); const tp = tons(C.pedra);
    f.ombraTerra(0, 64);
    f.rect(-31, -10, 62, 10, tp.ombra);
    f.rect(-25, -22, 50, 12, C.pedra);
    f.rect(-18, -70, 36, 48, tp.llum);
    f.rect(8, -70, 10, 48, C.pedra, { det: true, alfa: 0.7 });
    f.poly([[-21, -70], [0, -86], [21, -70]], C.pedra);
    f.rect(-12, -62, 24, 26, C.coure);
    for (let y = -58; y < -38; y += 4) f.linia(-9, y, 9 - ((y * 7) % 5), y, C.paper, 0.9, 0.9);  // inscripció
    f.poly([[6, -41], [11, -41], [9, -37]], C.violetaCercle, { det: true });                          // marca del Cercle
    f.pintar('tomba', esc);
  }

  // Fanal de gas
  {
    const f = new Figura(g, 20, 84, 10 * E, 82 * E);
    f.ombraTerra(0, 10);
    f.poly([[-5, 0], [5, 0], [4, -6], [-4, -6]], C.ferro);
    f.rect(-1.5, -62, 3, 56, C.ferro);
    f.poly([[-6, -72], [6, -72], [7, -66], [5, -60], [-5, -60], [-7, -66]], C.ferro);
    f.poly([[-4.5, -70], [4.5, -70], [5, -66], [3.5, -62], [-3.5, -62], [-5, -66]], C.ambreGas, { det: true });
    f.poly([[-4, -76], [4, -76], [6, -72], [-6, -72]], C.sutja);
    f.pintar('fanal', esc);
  }

  // Caixa de càrrega
  {
    const f = new Figura(g, 32, 36, 16 * E, 33 * E); const tf = tons(C.fustaClara);
    f.ombraTerra(0, 24);
    f.rect(-12, -20, 24, 20, C.fusta);
    f.rect(-12, -28, 24, 8, tf.llum);
    f.linia(-12, -10, 12, -10, tons(C.fusta).ombra, 1).linia(-12, -20, 12, 0, tons(C.fusta).ombra, 1);
    f.pintar('caixa', esc);
  }

  // Segell de la franja de l'interior (tancat) · petjada 4 × 1
  {
    const f = new Figura(g, 132, 156, 66 * E, 152 * E); const tr = tons(P.fosc);
    f.rect(-64, -130, 20, 130, P.fosc).rect(44, -130, 20, 130, P.fosc);
    f.rect(52, -130, 12, 130, tr.ombra, { det: true, alfa: 0.7 });
    f.rect(-66, -150, 132, 22, tr.llum);
    f.rect(-44, -126, 88, 126, C.sutja);
    for (let y = -118; y < 0; y += 14) f.linia(-44, y, 44, y, C.pissarra, 1, 0.6);
    // anell d'engranatge (mecanisme): dents + anell
    const R = 24, dents = 12, pts = [];
    for (let i = 0; i < dents * 2; i++) { const a = (i / (dents * 2)) * Math.PI * 2, r = i % 2 ? R : R + 5; pts.push([Math.cos(a) * r, -66 + Math.sin(a) * r]); }
    f.poly(pts, C.ferro);
    f.cercle(0, -66, 17, C.sutja);
    f.cercle(0, -66, 18.5, C.cianTeorema, { det: true, alfa: 0.35 });   // junta de llum tènue
    f.cercle(0, -66, 16, C.sutja, { det: true });
    f.rect(-2, -80, 4, 28, C.ferro).rect(-14, -68, 28, 4, C.ferro);
    f.pintar('segell', esc);
  }

  // Vaixell de vela amb roda de pales (vist en tres quarts)
  {
    const f = new Figura(g, 170, 110, 85 * E, 96 * E); const tf = tons(C.fusta);
    f.poly([[-80, 6], [66, 6], [82, -6], [66, -18], [-80, -18], [-84, -6]], C.aiguaFonda, { det: true, fons: true, alfa: 0.5 });
    f.poly([[-78, 0], [62, 0], [80, -14], [62, -28], [-78, -28], [-82, -14]], C.fusta);
    f.poly([[-72, -8], [58, -8], [70, -14], [58, -22], [-72, -22]], tf.llum);
    f.rect(-72, -6, 130, 3, C.teula, { det: true });
    const R = 11, pts = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; pts.push([-30 + Math.cos(a) * (i % 2 ? R : R + 3), 2 + Math.sin(a) * (i % 2 ? R : R + 3) * 0.5]); }
    f.poly(pts, C.coure);                                                 // roda de pales
    f.rect(8, -46, 8, 26, C.coure).rect(7, -50, 10, 4, C.sutja);          // xemeneia
    f.rect(-18, -92, 3, 76, C.fusta);                                     // pal
    f.poly([[-15, -90], [30, -70], [28, -36], [-15, -30]], C.paper);
    f.poly([[-15, -90], [30, -70], [8, -62], [-15, -60]], tons(C.paper).llum, { det: true, alfa: 0.7 });
    f.poly([[-19, -96], [-4, -93], [-19, -90]], P.neo);                   // gallardet
    f.pintar('vaixell', esc);
  }

  // Cartell de camí
  {
    const f = new Figura(g, 44, 60, 22 * E, 57 * E);
    f.ombraTerra(0, 14);
    f.rect(-2, -44, 4, 44, C.fusta);
    f.poly([[-18, -48], [14, -48], [20, -42], [14, -36], [-18, -36]], C.fustaClara);
    f.linia(-14, -42, 10, -42, C.sutja, 1.2, 0.9);
    f.pintar('cartell', esc);
  }

  // Marcador d'interacció ◆ i halos de llum (sense contorn: emeten llum)
  {
    const f = new Figura(g, 14, 18, 7 * E, 9 * E);
    f.poly([[0, -8], [6, 0], [0, 8], [-6, 0]], C.cianTeorema, { det: true });
    f.poly([[0, -4], [3, 0], [0, 4], [-3, 0]], '#e8fdff', { det: true });
    f.pintar('rombe', esc);
  }
  for (const [nom, col] of [['cian', C.cianTeorema], ['ambre', C.ambreGas], ['violeta', C.violetaCercle]]) {
    g.clear();
    const R = 64;
    for (let i = 12; i >= 1; i--) { g.fillStyle(num(col), 0.035 + (12 - i) * 0.012); g.fillCircle(R, R, (R * i) / 12); }
    g.generateTexture('halo-' + nom, R * 2, R * 2);
  }
  g.clear();
}

// ═══════════════ PERSONATGES (07 §7) ═══════════════
// Mateix esquelet per al protagonista i els NPC. 48 px d'alçada, tres caps.
// Textura de 40 × 56 (escala 1) amb els peus a (20, 53).
export const PEUS = { w: 40, h: 56, x: 20, y: 53 };

const BASES = {
  noi:    { pell: '#c68e6a', cabell: ['#1b1718', 'curt'], dalt: ['#5fa3d9', 'dessuadora'], baix: ['#2f4a7a', 'pantalo'], motxilla: '#d8413a', esp: 9, cint: 7 },
  noia:   { pell: '#e2b594', cabell: ['#6b4630', 'llarg'], dalt: ['#4caf6a', 'jaqueta'], baix: ['#262a33', 'faldilla'], motxilla: '#8c6bd1', esp: 8, cint: 6.5 },
  neutre: { pell: '#6e4630', cabell: ['#2f5fa8', 'mig'], dalt: ['#d9a62e', 'ampla'], baix: ['#8d939b', 'xandall'], motxilla: '#3a3f4a', esp: 10, cint: 10 }
};

// NPC del tall. La roba segueix el diccionari d'illa de 07 §10.4.
export const NPC_ASPECTE = {
  qasim:    { pell: '#9c6848', cabell: [C.safraRoba, 'turbant'], barba: '#8f8a86', dalt: [C.turquesa, 'tunica'], faixa: C.safraRoba, esp: 9.5, cint: 10 },
  emiliana: { pell: '#e2b594', cabell: ['#2a1d18', 'monyo'], dalt: ['#2f5a3f', 'vestit'], faixa: C.or, coll: C.or, esp: 8, cint: 9 },
  leo:      { pell: '#c68e6a', cabell: ['#6b4630', 'gorra'], gorra: C.indi, dalt: [C.teula, 'mariner'], pedacos: [C.turquesa, C.safraRoba, '#3d7bff', C.fulla], baix: ['#5a4636', 'pantalo'], esp: 8, cint: 6.5, alcada: 0.9 },
  venedora: { pell: '#9c6848', cabell: [C.teula, 'mocador'], dalt: [C.indi, 'tunica'], faixa: C.paper, davantal: C.paper, esp: 8.5, cint: 9 }
};

function persona(esc, g, clau, a, vista) {
  const f = new Figura(g, PEUS.w, PEUS.h, PEUS.x * E, PEUS.y * E);
  const pell = tons(a.pell), dalt = tons(a.dalt[0]), cab = tons(a.cabell[0]);
  const s = a.alcada || 1;                               // Leo és una mica més petit
  const Y = (y) => y * s;
  const P = (pts) => pts.map(([x, y]) => [x, Y(y)]);
  const llarga = a.dalt[1] === 'tunica' || a.dalt[1] === 'vestit';
  const perfil = vista === 'perfil', darrere = vista === 'darrere';

  f.ombraTerra(0, 22, 0.28, '#3b2e2e');

  // cabell llarg per darrere del cos
  if (a.cabell[1] === 'llarg' && !perfil) f.poly(P([[-8, -42], [8, -42], [9, -25], [-9, -25]]), cab.ombra);
  if (a.cabell[1] === 'llarg' && perfil) f.poly(P([[-6, -42], [0, -43], [-2, -26], [-8, -26]]), cab.ombra);
  // motxilla per darrere (davant: només en sobresurt la part de dalt)
  if (a.motxilla && vista === 'davant') f.poly(P([[-7, -28], [-6, -31.5], [6, -31.5], [7, -28]]), a.motxilla);
  if (a.motxilla && perfil) f.poly(P([[-12, -29], [-6, -30], [-5, -14], [-12, -15]]), a.motxilla);

  // cames i calçat
  if (!llarga) {
    const bc = tons(a.baix[0]);
    if (perfil) {
      f.rect(-3, Y(-12), 5, 12 * s, bc.ombra).rect(-1, Y(-12), 5, 12 * s, a.baix[0]);
      f.poly(P([[-3, -3], [6, -3], [7, 0], [-3, 0]]), '#e8e6df');
    } else {
      const legCol = a.baix[1] === 'faldilla' ? C.sutja : a.baix[0];
      f.rect(-6, Y(-12), 5, 12 * s, legCol).rect(1, Y(-12), 5, 12 * s, a.baix[1] === 'faldilla' ? C.sutja : bc.ombra);
      f.poly(P([[-7, -3], [0, -3], [0, 0], [-7, 0]]), '#e8e6df').poly(P([[0, -3], [7, -3], [7, 0], [0, 0]]), '#e8e6df');
      f.rect(-7, Y(-0.8), 14, 0.8 * s, '#b9b6ad', { det: true });
      if (a.baix[1] === 'faldilla') f.poly(P([[-7, -15], [7, -15], [9, -9], [-9, -9]]), a.baix[0]);
    }
  } else {
    // túnica o vestit fins als peus
    f.poly(P([[-2, -2], [4, -2], [4, 0], [-2, 0]]), C.fusta);
    if (!perfil) f.poly(P([[-6, -2], [-1, -2], [-1, 0], [-6, 0]]), C.fusta);
  }

  // tors
  const e = a.esp, c = a.cint;
  let tors;
  if (perfil) tors = llarga ? [[-5, -28], [5, -28], [7, -3], [-6, -3]] : [[-5, -28], [5, -28], [4.5, -12], [-4.5, -12]];
  else if (llarga) tors = [[-e, -28], [e, -28], [e + 2, -3], [-e - 2, -3]];
  else if (a.dalt[1] === 'ampla') tors = [[-e, -28], [e, -28], [e, -10], [e - 1, -9], [-e + 1, -9], [-e, -10]];
  else tors = [[-e, -28], [e, -28], [c, -12], [-c, -12]];
  f.poly(P(tors), a.dalt[0]);
  if (!perfil) f.poly(P([[e * 0.35, -28], [e, -28], [llarga ? e + 2 : a.dalt[1] === 'ampla' ? e : c, llarga ? -3 : a.dalt[1] === 'ampla' ? -10 : -12], [c * 0.35, llarga ? -3 : -12]]), dalt.ombra, { det: true, alfa: 0.8 });
  // detalls de roba
  if (a.dalt[1] === 'jaqueta' && vista === 'davant') { f.poly(P([[-2.5, -28], [2.5, -28], [2, -12], [-2, -12]]), '#e8e6df', { det: true }); }
  if (a.dalt[1] === 'ampla' && vista === 'davant') f.rect(-5, Y(-17), 10, 4 * s, dalt.ombra, { det: true });
  if (a.dalt[1] === 'mariner') { (a.pedacos || []).forEach((col, i) => f.rect([-6, 3, -4, 2][i], Y([-24, -21, -16, -15][i]), 3.2, 3.2 * s, col, { det: true })); }
  if (a.faixa) f.poly(P(perfil ? [[-5, -18], [5.5, -18], [5.7, -15], [-5.3, -15]] : [[-e + 0.5, -18], [e - 0.5, -18], [e - 0.3, -15], [-e + 0.3, -15]]), a.faixa, { det: true });
  if (a.davantal && vista === 'davant') f.poly(P([[-5, -16], [5, -16], [6, -4], [-6, -4]]), a.davantal, { det: true, alfa: 0.9 });
  if (a.coll && !darrere) f.poly(P(perfil ? [[1, -31], [5, -31], [5, -27], [1, -28]] : [[-5, -31], [5, -31], [4, -27], [0, -26], [-4, -27]]), a.coll);
  // coll de dessuadora (caputxa)
  if (a.dalt[1] === 'dessuadora' || a.dalt[1] === 'ampla') {
    if (vista === 'davant') f.poly(P([[-6, -29], [6, -29], [5, -27], [0, -25], [-5, -27]]), dalt.ombra);
    if (darrere) f.poly(P([[-7, -30], [7, -30], [6, -23], [-6, -23]]), dalt.ombra);
  }
  // motxilla vista de darrere: el volum sencer
  if (a.motxilla && darrere) {
    f.poly(P([[-8, -29], [8, -29], [8.5, -15], [7, -13], [-7, -13], [-8.5, -15]]), a.motxilla);
    f.rect(-5, Y(-21), 10, 5 * s, tons(a.motxilla).ombra);
  }
  // corretges i insígnia de Viatger (07 §7.3)
  if (a.motxilla && vista === 'davant') {
    f.rect(-6, Y(-28), 2, 11 * s, tons(a.motxilla).ombra, { det: true }).rect(4, Y(-28), 2, 11 * s, tons(a.motxilla).ombra, { det: true });
    const hx = 5, hy = Y(-22); f.poly([[hx, hy - 2], [hx + 1.6, hy - 1.2], [hx + 2, hy + 0.6], [hx + 1, hy + 2], [hx - 1, hy + 2], [hx - 2, hy + 0.6], [hx - 1.6, hy - 1.2]], C.coure, { det: true });
  }

  // braços
  if (perfil) {
    f.poly(P([[-1, -27], [3, -27], [4, -15], [0, -15]]), dalt.ombra);
    f.poly(P([[0, -15], [4, -15], [4, -12], [0, -12]]), a.pell);
  } else {
    const bx = e + (llarga ? 1 : 0);
    f.poly(P([[-bx, -27], [-bx - 4, -26], [-bx - 5, -14], [-bx - 1, -14]]), a.dalt[0]);
    f.poly(P([[bx, -27], [bx + 4, -26], [bx + 5, -14], [bx + 1, -14]]), dalt.ombra);
    f.poly(P([[-bx - 5, -14], [-bx - 1, -14], [-bx - 1.5, -11], [-bx - 4.5, -11]]), a.pell);
    f.poly(P([[bx + 5, -14], [bx + 1, -14], [bx + 1.5, -11], [bx + 4.5, -11]]), pell.ombra);
  }

  // cap
  if (perfil) {
    f.rect(0, Y(-31), 4, 3 * s, pell.ombra);                                         // coll
    f.poly(P([[-5, -44], [3, -45], [6, -43], [6, -40], [8, -38], [6, -36.5], [6, -34], [7.5, -31.5], [5, -29], [0, -29], [-3, -31], [-5, -35]]), a.pell);
    f.rect(-1, Y(-37), 2, 3 * s, pell.ombra, { det: true });                         // orella
    f.rect(3.5, Y(-38), 1.6, 2.6 * s, C.tinta, { det: true });                       // ull
  } else {
    f.poly(P([[-5, -44], [5, -44], [7, -42], [7, -35], [5, -30], [2, -29], [-2, -29], [-5, -30], [-7, -35], [-7, -42]]), a.pell);
    f.poly(P([[3, -44], [5, -44], [7, -42], [7, -35], [5, -30], [3, -29.5]]), pell.ombra, { det: true, alfa: 0.7 });
    if (!darrere) {
      f.rect(-3.6, Y(-38), 1.6, 2.6 * s, C.tinta, { det: true }).rect(2, Y(-38), 1.6, 2.6 * s, C.tinta, { det: true });
      f.rect(-1.5, Y(-32.2), 3, 0.7 * s, pell.ombra, { det: true });
    }
  }
  if (a.barba && !darrere) f.poly(P(perfil ? [[0, -33], [6.5, -33], [6, -28.5], [1, -27]] : [[-6, -34], [6, -34], [5, -28], [2, -26], [-2, -26], [-5, -28]]), a.barba);

  // cabell o tocat
  const forma = a.cabell[1], col = a.cabell[0];
  const H = (pts) => f.poly(P(pts), col);
  if (darrere && ['curt', 'mig', 'llarg'].includes(forma)) H([[-7.5, -45], [7.5, -45], [8, -35], [5, -30], [-5, -30], [-8, -35]]);
  else if (perfil && ['curt', 'mig', 'llarg'].includes(forma)) H([[-5.5, -45], [3, -46], [7, -43], [5, -41], [0, -41], [-1, -36], [-5.5, -33]]);
  else if (forma === 'curt') H([[-7.5, -42], [-5, -45.5], [5, -45.5], [7.5, -42], [7.5, -38], [6, -40], [-6, -40], [-7.5, -38]]);
  else if (forma === 'llarg') H([[-8, -41], [-5, -46], [5, -46], [8, -41], [8, -31], [6.5, -31], [6, -39], [-6, -39], [-6.5, -31], [-8, -31]]);
  else if (forma === 'mig') H([[-8, -40], [-7, -45], [-3, -46.5], [2, -46], [6, -45.5], [8.5, -41], [8, -34], [6.5, -36], [5, -39], [-5, -39], [-6.5, -36], [-8, -34]]);
  else if (forma === 'turbant') {
    H(perfil ? [[-6, -41], [-5, -47], [2, -48.5], [7, -45], [7, -41]] : [[-8, -40], [-7, -46], [0, -48.5], [7, -46], [8, -40], [6, -39.5], [-6, -39.5]]);
    f.linia(-7, -43.5, 7, -45.5, tons(col).ombra, 1, 0.9);
  } else if (forma === 'mocador') {
    H(perfil ? [[-6, -45], [3, -47], [6, -43], [5, -40], [-1, -40], [-2, -30], [-7, -27], [-7, -38]] :
      [[-8, -36], [-8, -43], [-5, -46.5], [5, -46.5], [8, -43], [8, -36], [9, -28], [5, -29], [6, -39], [-6, -39], [-5, -29], [-9, -28]]);
  } else if (forma === 'monyo') {
    H(perfil ? [[-5.5, -45], [3, -46], [6, -43], [0, -41], [-5, -36]] : [[-7.5, -40], [-6, -45], [6, -45], [7.5, -40], [6, -41], [-6, -41]]);
    f.poly(P([[-3, -45], [-2.5, -49], [2.5, -49], [3, -45]]), col);
    f.rect(-3, Y(-46), 6, 1 * s, a.faixa || C.or, { det: true });
  } else if (forma === 'gorra') {
    f.poly(P([[-7, -38], [-8, -42], [8, -42], [7, -38], [6, -40], [-6, -40]]), col);             // cabell que surt
    f.poly(P(perfil ? [[-6, -42], [-5, -47], [5, -47], [6, -42]] : [[-8, -41], [-7, -47], [7, -47], [8, -41]]), a.gorra);
    if (!darrere) f.poly(P(perfil ? [[4, -42], [10, -42], [9, -40], [4, -40]] : [[-8, -41], [8, -41], [9, -39], [-9, -39]]), tons(a.gorra).ombra);
  }
  return f.pintar(clau, esc);
}

// ═══════════════ PUNT D'ENTRADA ═══════════════
export function generarTextures(escena, illa = 'algerba') {
  const g = escena.make.graphics({ add: false });
  const P = ILLES[illa];
  caselles(escena, g, P);
  objectes(escena, g, P);
  for (const [nom, a] of Object.entries(BASES)) for (const v of ['davant', 'darrere', 'perfil']) persona(escena, g, `jug-${nom}-${v}`, a, v);
  for (const [id, a] of Object.entries(NPC_ASPECTE)) persona(escena, g, `npc-${id}`, a, 'davant');
  g.destroy();
}
