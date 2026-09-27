/**
 * ─────────────────────────────────────────────────────────────
 * NUMÈRIA · Servidor (Google Apps Script)
 * Inici de sessió amb codi i contrasenya, desat de la partida i telemetria.
 * Va lligat a un full de càlcul de Google amb tres pestanyes:
 *   Alumnes     codi | contrasenya | curs | itinerari | actiu
 *   Partides    codi | partida (JSON) | actualitzat
 *   Telemetria  un registre per repte resolt o abandonat
 * El full no guarda cap nom d'alumne: l'aparellament codi ↔ nom és en un full
 * privat a part (01 §4).
 * ─────────────────────────────────────────────────────────────
 */

const FULLS = {
  alumnes: ['codi', 'contrasenya', 'curs', 'itinerari', 'actiu'],
  partides: ['codi', 'partida', 'actualitzat'],
  telemetria: ['rebut', 'data', 'codi', 'sessio', 'id', 'repte', 'saber', 'tipus', 'nivell', 'itinerari', 'encert', 'intents', 'pistes', 'temps_s']
};
const NOMS = { alumnes: 'Alumnes', partides: 'Partides', telemetria: 'Telemetria' };

// ── Menú al full de càlcul ──
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Numèria')
    .addItem('1 · Preparar el full', 'configurar')
    .addItem('2 · Generar contrasenyes que faltin', 'generarContrasenyes')
    .addToUi();
}

// Crea les pestanyes amb les capçaleres i un alumne de prova (PROVA01 / numeria).
function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const k of Object.keys(FULLS)) {
    let f = ss.getSheetByName(NOMS[k]);
    if (!f) f = ss.insertSheet(NOMS[k]);
    if (f.getLastRow() === 0) { f.appendRow(FULLS[k]); f.setFrozenRows(1); f.getRange(1, 1, 1, FULLS[k].length).setFontWeight('bold'); }
  }
  const al = ss.getSheetByName(NOMS.alumnes);
  if (al.getLastRow() === 1) {
    al.appendRow(['PROVA01', 'numeria', '1', 'ESO', 'sí']);
    al.appendRow(['PROVA03', 'numeria', '3', 'ESO', 'sí']);
    al.appendRow(['PROVAB1', 'numeria', 'B1', 'MACS', 'sí']);
  }
  al.getRange('A:B').setNumberFormat('@');    // codis i contrasenyes sempre com a text
  SpreadsheetApp.getUi().alert('Full preparat. Ara: Implementa → Implementació nova → Aplicació web.');
}

// Omple amb una contrasenya aleatòria de 6 caràcters les files que no en tenen.
function generarContrasenyes() {
  const f = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMS.alumnes);
  const dades = f.getDataRange().getValues();
  const lletres = 'abcdefghjkmnpqrstuvwxyz23456789';     // sense l, 1, o, 0 per evitar confusions
  let n = 0;
  for (let i = 1; i < dades.length; i++) {
    if (dades[i][0] && !dades[i][1]) {
      let c = ''; for (let k = 0; k < 6; k++) c += lletres[Math.floor(Math.random() * lletres.length)];
      f.getRange(i + 1, 2).setValue(c); n++;
    }
  }
  SpreadsheetApp.getUi().alert(n + ' contrasenyes generades.');
}

// ── Entrada de l'aplicació web ──
function doGet() {
  return json({ ok: true, missatge: 'Numèria · servidor actiu' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'Petició mal formada.' }); }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const alumne = autenticar(req.codi, req.contrasenya);
    if (!alumne) return json({ ok: false, error: 'Codi o contrasenya incorrectes.' });
    if (req.accio === 'login') return json({ ok: true, curs: alumne.curs, itinerari: alumne.itinerari, partida: llegirPartida(alumne.codi) });
    if (req.accio === 'desar') {
      if (req.partida) desarPartida(alumne.codi, req.partida);
      if (Array.isArray(req.registres) && req.registres.length) afegirTelemetria(alumne.codi, req.registres);
      return json({ ok: true });
    }
    return json({ ok: false, error: 'Acció desconeguda.' });
  } catch (err) {
    return json({ ok: false, error: 'Error del servidor: ' + err.message });
  } finally {
    lock.releaseLock();
  }
}

// ── Funcions internes ──
function full(k) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMS[k]); }
function json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function autenticar(codi, contrasenya) {
  if (!codi || !contrasenya) return null;
  const dades = full('alumnes').getDataRange().getValues();
  for (let i = 1; i < dades.length; i++) {
    const [c, p, curs, itin, actiu] = dades[i];
    if (String(c).trim().toUpperCase() === String(codi).trim().toUpperCase() && String(p) === String(contrasenya)) {
      if (String(actiu).trim().toLowerCase() === 'no') return null;
      return { codi: String(c).trim().toUpperCase(), curs: String(curs), itinerari: String(itin || '') };
    }
  }
  return null;
}

function llegirPartida(codi) {
  const f = full('partides'), dades = f.getDataRange().getValues();
  for (let i = 1; i < dades.length; i++) if (dades[i][0] === codi) { try { return JSON.parse(dades[i][1]); } catch (e) { return null; } }
  return null;
}

function desarPartida(codi, partida) {
  const f = full('partides'), dades = f.getDataRange().getValues();
  const fila = [codi, JSON.stringify(partida), new Date()];
  for (let i = 1; i < dades.length; i++) if (dades[i][0] === codi) { f.getRange(i + 1, 1, 1, 3).setValues([fila]); return; }
  f.appendRow(fila);
}

function afegirTelemetria(codi, registres) {
  const f = full('telemetria'), ara = new Date();
  const files = registres.slice(0, 200).map((r) => [
    ara, r.data || '', codi, r.sessio || '', r.id || '', r.repte || '', r.saber || '', r.tipus || '', r.nivell || '', r.itinerari || '',
    r.encert ? 1 : 0, Number(r.intents) || 0, Number(r.pistes) || 0, Number(r.temps_s) || 0
  ]);
  f.getRange(f.getLastRow() + 1, 1, files.length, files[0].length).setValues(files);
}
