// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓ · l'únic fitxer que Xavi ha de tocar per posar-ho en marxa
// ─────────────────────────────────────────────────────────────

export const CONFIG = {
  // Enganxa aquí l'URL de l'aplicació web d'Apps Script (acaba en /exec).
  // Si es deixa buit, el joc funciona igual però només desa al navegador.
  URL_APPS_SCRIPT: 'https://script.google.com/macros/s/AKfycbwmQrSp0thguo9CLim2NvmHFnS_2mNfFbPlFNqJkx6v768QTUtSXLifd-86R6p2cMUhPw/exec',

  // Cada quants segons s'intenta enviar la cua pendent si no hi ha connexió.
  REINTENT_S: 30,

  // Corones per repte superat, segons la dificultat del repte (no del nivell de l'alumne, 04 §3.3).
  CORONES_PER_REPTE: 5,

  VERSIO: '0.1.0-tall-equatia'
};
