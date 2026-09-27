// ─────────────────────────────────────────────────────────────
// MAPA · EQUATIA (Al-Gerba, franja A: costa i poble)
// Tot són dades: el terra, els objectes, els NPC i els punts d'interacció.
// Coordenades en caselles (x cap a llevant, y cap al sud a la pantalla).
// ─────────────────────────────────────────────────────────────

export const AMPLE = 40, ALT = 26;

// Llegenda del terra:  ^ roca · . sorra · , empedrat · t rajola de plaça · " herba d'oasi
//                      w aigua de costa · ~ mar · = moll de fusta
function terra() {
  const m = [];
  for (let y = 0; y < ALT; y++) {
    let fila = '';
    for (let x = 0; x < AMPLE; x++) {
      let c = ',';
      if (y <= 1) c = '^';
      else if (y >= 20) c = '~';
      else if (y === 19) c = 'w';
      else if (x >= 31) c = (x - 35) ** 2 / 12 + (y - 13) ** 2 / 6 + ((x * 7 + y * 3) % 5) / 12 < 1 ? '"' : '.';
      else if (x <= 3) c = '.';
      else if (y >= 10 && y <= 15 && x >= 6 && x <= 28) c = 't';
      if ((x >= 9 && x <= 10) || (x >= 25 && x <= 26)) { if (y >= 19 && y <= 23) c = '='; }
      fila += c;
    }
    m.push(fila);
  }
  return m;
}
export const TERRA = terra();
export const SOLID_TERRA = new Set(['^', '~', 'w']);

// Objectes: [textura, x, y, petjada ample, petjada alt]. La textura es dibuixa amb la base
// a la part de baix de la petjada; la petjada és sòlida.
export const OBJECTES = [
  ['casa-0', 4, 3, 3, 2], ['basar', 9, 2, 6, 3], ['casa-1', 22, 3, 3, 2], ['casa-2', 26, 3, 3, 2],
  ['casa-1', 4, 6, 3, 2], ['casa-0', 27, 6, 3, 2],
  ['segell', 18, 2, 4, 1],
  ['parada-0', 8, 11, 2, 1], ['parada-1', 12, 11, 2, 1], ['parada-0', 21, 11, 2, 1], ['parada-1', 25, 14, 2, 1],
  ['balanca', 16, 12, 2, 2],
  ['fanal', 7, 9, 1, 1], ['fanal', 16, 9, 1, 1], ['fanal', 24, 9, 1, 1], ['fanal', 7, 16, 1, 1], ['fanal', 17, 16, 1, 1], ['fanal', 28, 16, 1, 1],
  ['caixa', 12, 17, 1, 1], ['caixa', 13, 17, 1, 1], ['caixa', 22, 17, 1, 1], ['caixa', 29, 17, 1, 1],
  ['tomba', 35, 8, 2, 2],
  ['palmera-0', 32, 4, 1, 1], ['palmera-1', 38, 5, 1, 1], ['palmera-0', 33, 11, 1, 1], ['palmera-1', 37, 14, 1, 1],
  ['palmera-1', 39, 10, 1, 1], ['palmera-0', 1, 7, 1, 1], ['palmera-1', 2, 16, 1, 1], ['palmera-0', 31, 17, 1, 1],
  ['cartell', 1, 12, 1, 1],
  ['vaixell', 28, 21, 5, 2]
];

// Punts d'interacció. Els NPC tenen retrat (inicial en un heptàgon mentre no hi hagi retrats).
export const INTERACCIONS = [
  { id: 'qasim',    tipus: 'npc', x: 12, y: 5.6, nom: 'Qàsim ibn Jabr', dialeg: 'qasim', repte: 'qasim' },
  { id: 'venedora', tipus: 'npc', x: 14, y: 11, nom: 'Venedora de dàtils', dialeg: 'venedora', repte: 'venedora' },
  { id: 'emiliana', tipus: 'npc', x: 23, y: 12, nom: 'Emiliana Rho', dialeg: 'emiliana', repte: 'emiliana' },
  { id: 'leo',      tipus: 'npc', x: 26, y: 18, nom: 'Leo Summi', dialeg: 'leo', repte: 'leo' },
  { id: 'tomba',    tipus: 'objecte', x: 36, y: 10, dialeg: 'tomba', repte: 'tomba', llum: 'cian' },
  { id: 'segell',   tipus: 'objecte', x: 20, y: 3, dialeg: 'segell' },
  { id: 'cartell',  tipus: 'objecte', x: 1.5, y: 13, dialeg: 'cartell' },
  { id: 'balanca',  tipus: 'objecte', x: 17, y: 14, dialeg: 'balanca' }
];

export const INICI = { x: 20, y: 4.3 };   // just a sota del segell, en baixar del Camí Reial
