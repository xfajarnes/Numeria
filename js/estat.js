// ─────────────────────────────────────────────────────────────
// ESTAT DE LA PARTIDA, NIVELL I DESAT LOCAL
// ─────────────────────────────────────────────────────────────

export const estat = {
  alumne: null,        // { codi, contrasenya } quan hi ha sessió; null en mode convidat
  convidat: true,
  nivell: 'A',         // A = 1r-2n ESO · B = 3r-4t ESO · C = Batxillerat (franges de 04 §3.1)
  itinerari: 'ESO',    // ESO · MAT · MACS
  sessio: Math.random().toString(36).slice(2, 10),
  partida: null
};

// El curs ve del full del professor (04 §3.1). Accepta formes habituals: 1, 2, 1ESO, 3r, B1, 1BAT, 2n batx…
export function nivellDeCurs(curs) {
  const c = String(curs || '').toUpperCase().replace(/\s/g, '');
  if (/B|BAT/.test(c)) return 'C';
  const n = parseInt(c, 10);
  if (n === 3 || n === 4) return 'B';
  return 'A';
}
export function itinerariNet(it, nivell) {
  if (nivell !== 'C') return 'ESO';
  return /MACS|CCSS|SOC/i.test(String(it || '')) ? 'MACS' : 'MAT';
}

export function partidaNova(nom = 'Viatger', base = 'noi') {
  return {
    versio: 1,
    nom, base,                    // base: noi · noia · neutre (07 §7.2)
    pos: null,                    // { x, y } en píxels del mapa
    corones: 0,
    reptes: {},                   // { qasim: { encerts: 2 }, ... }
    domini: {},                   // { 'E-NUM-44': { encerts, intents } }
    actualitzat: Date.now()
  };
}

// Aplica els registres d'un repte a la partida (Corones i domini).
export function aplicarRegistres(registres, coronesPerRepte) {
  const p = estat.partida;
  for (const r of registres) {
    const d = (p.domini[r.saber] ||= { encerts: 0, intents: 0 });
    d.intents += r.intents;
    if (r.encert) {
      d.encerts++;
      p.corones += coronesPerRepte;
      (p.reptes[r.repte] ||= { encerts: 0 }).encerts++;
    }
  }
  p.actualitzat = Date.now();
}

const clauLocal = () => 'numeria.partida.' + (estat.alumne ? estat.alumne.codi : 'convidat');
export function desarLocal() {
  try { localStorage.setItem(clauLocal(), JSON.stringify(estat.partida)); } catch { /* navegador sense emmagatzematge */ }
}
export function carregarLocal() {
  try { return JSON.parse(localStorage.getItem(clauLocal()) || 'null'); } catch { return null; }
}

// De dues partides (núvol i local) es queda la més recent.
export function mesRecent(a, b) {
  if (!a) return b; if (!b) return a;
  return (a.actualitzat || 0) >= (b.actualitzat || 0) ? a : b;
}
