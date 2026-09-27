// ─────────────────────────────────────────────────────────────
// BIBLIOTECA D'ART · PALETA (07-art §3 i §4)
// Cap peça porta colors escrits a mà: tot surt d'aquí.
// ─────────────────────────────────────────────────────────────

export const C = {
  // §3.1 base
  tinta: '#0d0f14', nit: '#151922', sutja: '#232833', pissarra: '#3a4454', pedra: '#6b6f73', boira: '#9aa3ab',
  paper: '#e9e2cf', fusta: '#5a4636', fustaClara: '#8a6a4c', molsa: '#3b4a40',
  aiguaFonda: '#123540', aigua: '#1f4a55', aiguaClara: '#5fc7d0',
  // §3.2 colors vius
  teula: '#c8553d', safraRoba: '#e0a83e', turquesa: '#2e9c9a', indi: '#3b5ba5', fulla: '#5c9e4a', flor: '#d9708f',
  // §3.3 metalls
  ferro: '#4a4f58', coure: '#c07a3e', llauto: '#b8913a', or: '#e3b341', verdet: '#4f9c8a',
  // §3.4 llums amb significat
  cianTeorema: '#2ee6ff', ambreGas: '#ffb347', vermellAlarma: '#ff2e3e', violetaCercle: '#a855ff', prima: '#ffd98a', secunda: '#d6e2ff'
};

// §4.1 paletes per illa
export const ILLES = {
  vertex:      { terra: '#5a4f4a', mig: '#8a7466', fosc: '#1d2d5c', accent: '#c07a3e', detall: '#e3b341', neo: '#ffd166', tintDia: ['#ffd9a0', 0.10, 'screen'], tintFosc: ['#1a1838', 0.45, 'multiply'] },
  algerba:     { terra: '#d9b77e', mig: '#b8744a', fosc: '#3b2e2e', accent: '#2e9c9a', detall: '#6f9146', neo: '#ff9f1c', tintDia: ['#ffe2b0', 0.08, 'screen'], tintFosc: ['#2a1a10', 0.40, 'multiply'] },
  geometrium:  { terra: '#e2ded2', mig: '#7fa35a', fosc: '#2f4a35', accent: '#8fb3c9', detall: '#f2f5f8', neo: '#2bf59c', tintDia: ['#e3eeff', 0.06, 'screen'], tintFosc: ['#101c24', 0.35, 'multiply'] },
  calculistan: { terra: '#5f9a55', mig: '#3a8aa3', fosc: '#3a4454', accent: '#4f9c8a', detall: '#a85a3f', neo: '#3d7bff', tintDia: ['#d6f0ff', 0.06, 'screen'], tintFosc: ['#1a1410', 0.35, 'multiply'] },
  opermetica:  { terra: '#5c6a4a', mig: '#1f2e24', fosc: '#1c1a1d', accent: '#3d2a22', detall: '#b8913a', neo: '#ff5e1a', tintDia: ['#ffd0a0', 0.08, 'screen'], tintFosc: ['#3a1208', 0.35, 'multiply'] },
  statisland:  { terra: '#8fb050', mig: '#d6c078', fosc: '#2a2522', accent: '#4f6b3a', detall: '#c8d0d2', neo: '#c8ff2e', tintDia: null, tintFosc: ['#d9e0e2', 0.30, 'screen'] },
  probabiloria:{ terra: '#f0f4f8', mig: '#a8c2d6', fosc: '#4a525c', accent: '#7a2a45', detall: '#3a3030', neo: '#ff4fb8', tintDia: ['#eef3ff', 0.08, 'screen'], tintFosc: ['#141a2e', 0.50, 'multiply'] },
  logicium:    { terra: '#e3d2ae', mig: '#c29c5e', fosc: '#1a1614', accent: '#4a4f58', detall: '#e9e2cf', neo: '#2ee6ff', tintDia: ['#fff4d6', 0.15, 'screen'], tintFosc: ['#0b1a22', 0.45, 'multiply'] }
};

// §5 i §6 constants de traç, ombra, halo i mida
export const E = 2;                          // escala de dibuix: 1 casella = 32 px a escala 1 = 64 px al món
export const CASELLA = 32 * E;
export const TRAC_EXT = 2, TRAC_INT = 1;
export const OMBRA_DESPL = [4, 3], OMBRA_ALFA_DIA = 0.25, OMBRA_ALFA_FOSC = 0.4;
export const HALO = [[2, 0.35], [4, 0.12]];
export const PULS_S = 2.4;                   // cicle de pols dels elements interactius

// §3.5 tres tons derivats en HSL
export function tons(hex) {
  const [h, s, l] = aHsl(hex);
  return {
    llum: deHsl(capA(h, 55, 8), s, Math.min(100, l + 12)),              // més clar i cap al càlid (groc)
    base: hex,
    ombra: deHsl(capA(h, 250, 12), Math.max(0, s - 8), Math.max(0, l - 15)) // més fosc, menys saturat i cap al fred (blau-violeta)
  };
}
// Gira el to h fins a 'graus' cap al to objectiu, pel camí més curt.
function capA(h, objectiu, graus) {
  let d = ((objectiu - h + 540) % 360) - 180;
  return h + Math.sign(d) * Math.min(Math.abs(d), graus);
}
export const num = (hex) => parseInt(hex.slice(1), 16);   // '#rrggbb' → 0xrrggbb per a Phaser

function aHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
  }
  return [h, s * 100, l * 100];
}
function deHsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return '#' + [f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
