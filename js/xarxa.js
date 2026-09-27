// ─────────────────────────────────────────────────────────────
// CONNEXIÓ AMB APPS SCRIPT · inici de sessió, desat al núvol i telemetria
// Les dades s'envien per paquets als punts de control, amb una cua local
// si no hi ha connexió (01 §5).
// ─────────────────────────────────────────────────────────────
import { CONFIG } from './config.js';
import { estat, desarLocal } from './estat.js';

const CLAU_CUA = 'numeria.cua';
let avisar = () => {};                 // la HUD s'hi subscriu per mostrar l'estat del núvol
export function enEstatNuvol(fn) { avisar = fn; }
export const hiHaServidor = () => !!CONFIG.URL_APPS_SCRIPT;

// Petició a Apps Script. S'envia com a text pla per evitar la consulta prèvia CORS.
async function crida(accio, dades = {}) {
  const r = await fetch(CONFIG.URL_APPS_SCRIPT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ accio, ...dades }),
    redirect: 'follow'
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  if (!j.ok) throw Object.assign(new Error(j.error || 'Error del servidor'), { servidor: true });
  return j;
}

export async function iniciarSessio(codi, contrasenya) {
  return crida('login', { codi, contrasenya });   // → { ok, curs, itinerari, partida }
}

// ── Cua de telemetria ──
function llegirCua() { try { return JSON.parse(localStorage.getItem(CLAU_CUA) || '[]'); } catch { return []; } }
function escriureCua(c) { try { localStorage.setItem(CLAU_CUA, JSON.stringify(c)); } catch {} }

export function afegirRegistres(registres) {
  if (!estat.alumne) return;                       // en mode convidat no s'envia res
  const ara = new Date().toISOString();
  const cua = llegirCua();
  for (const r of registres) cua.push({ ...r, data: ara, codi: estat.alumne.codi, sessio: estat.sessio, id: Math.random().toString(36).slice(2, 12) });
  escriureCua(cua);
}

let enviant = false;
// Punt de control: desa la partida local i, si hi ha sessió, envia partida + cua en una sola petició.
export async function puntDeControl() {
  desarLocal();
  if (!estat.alumne) { avisar('local'); return; }
  if (!hiHaServidor()) { avisar('local'); return; }
  if (enviant) return;
  enviant = true;
  const cua = llegirCua();
  avisar('enviant');
  try {
    await crida('desar', { codi: estat.alumne.codi, contrasenya: estat.alumne.contrasenya, partida: estat.partida, registres: cua });
    const resta = llegirCua().filter((r) => !cua.some((e) => e.id === r.id));   // pot haver entrat alguna cosa mentre enviàvem
    escriureCua(resta);
    avisar(resta.length ? 'pendent' : 'desat');
  } catch (e) {
    avisar(e.servidor ? 'error' : 'pendent');
    console.warn('[Numèria] No s\'ha pogut desar al núvol:', e.message);
  } finally { enviant = false; }
}

// Si queda alguna cosa pendent, es torna a provar cada cert temps i quan torna la connexió.
setInterval(() => { if (estat.alumne && llegirCua().length) puntDeControl(); }, CONFIG.REINTENT_S * 1000);
window.addEventListener('online', () => { if (estat.alumne) puntDeControl(); });
