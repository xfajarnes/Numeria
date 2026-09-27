// ─────────────────────────────────────────────────────────────
// HUD i QUADERN · Corones, nivell, estat del núvol, botó d'acció i panell del Quadern
// ─────────────────────────────────────────────────────────────
import { estat } from './estat.js';
import { REPTES } from './reptes/generadors.js';
import { enEstatNuvol, puntDeControl, hiHaServidor } from './xarxa.js';

const NOM_NIVELL = { A: '1r-2n ESO', B: '3r-4t ESO', C: 'Batxillerat' };
const NUVOL = {
  local:   ['◇', 'Desat en aquest navegador'],
  enviant: ['◈', 'Desant al núvol…'],
  desat:   ['◆', 'Desat al núvol'],
  pendent: ['◇', 'Pendent d\'enviar (sense connexió)'],
  error:   ['✗', 'El servidor ha rebutjat el desat']
};
const $ = (id) => document.getElementById(id);

export const hud = {
  onAccio: null,
  onPausa: null,
  mostrar() {
    $('hud').hidden = false;
    $('boto-accio').onclick = () => this.onAccio && this.onAccio();
    $('boto-quadern').onclick = () => obrirQuadern();
    enEstatNuvol((e) => { const [ic, txt] = NUVOL[e]; $('hud-nuvol').textContent = ic; $('hud-nuvol').title = txt; $('hud-nuvol').dataset.estat = e; });
    const e0 = estat.alumne && hiHaServidor() ? 'desat' : 'local';
    const [ic, txt] = NUVOL[e0]; $('hud-nuvol').textContent = ic; $('hud-nuvol').title = txt; $('hud-nuvol').dataset.estat = e0;
  },
  actualitzar() {
    $('hud-corones').textContent = estat.partida.corones;
    $('hud-nivell').textContent = NOM_NIVELL[estat.nivell] + (estat.nivell === 'C' ? ' · ' + estat.itinerari : '');
  },
  proper(etiqueta) {
    const b = $('boto-accio');
    b.disabled = !etiqueta;
    b.textContent = etiqueta || '·';
    $('pista-tecla').hidden = !etiqueta;
    if (etiqueta) $('pista-tecla').textContent = `E · ${etiqueta}`;
  },
  pausar(si) { $('hud').classList.toggle('pausa', si); }
};

function obrirQuadern() {
  const capa = $('capa-quadern');
  const p = estat.partida;
  const files = Object.entries(REPTES).map(([id, r]) => {
    const n = p.reptes[id]?.encerts || 0;
    return `<li class="${n ? 'fet' : ''}"><span class="marca">${n ? '◆' : '◇'}</span><span>${r.titol}</span><span class="tipus">${r.tipus}</span><span class="n">${n ? '× ' + n : ''}</span></li>`;
  }).join('');
  const domini = Object.entries(p.domini).map(([s, d]) => `<li><span>${s}</span><span class="n">${d.encerts} ${d.encerts === 1 ? 'encert' : 'encerts'} · ${d.intents} ${d.intents === 1 ? 'intent' : 'intents'}</span></li>`).join('') || '<li class="buit">Encara res. Parla amb la gent d\'Equatia.</li>';
  capa.innerHTML = `
    <div class="quadern targeta" role="dialog" aria-modal="true">
      <header><h2>Quadern de ${p.nom}</h2><button type="button" class="tancar" aria-label="Tancar">✕</button></header>
      <p class="sub">${estat.convidat ? 'Mode convidat · no s\'envia res al núvol' : 'Codi ' + estat.alumne.codi} · Nivell ${NOM_NIVELL[estat.nivell]}${estat.nivell === 'C' ? ' ' + estat.itinerari : ''} · ◈ ${p.corones} Corones</p>
      <h3>Encàrrecs d'Equatia</h3><ul class="llista">${files}</ul>
      <h3>Sabers treballats</h3><ul class="llista petita">${domini}</ul>
      ${estat.convidat ? `
      <h3>Filtre de nivell (només en mode convidat)</h3>
      <div class="nivells">
        ${[['A', 'ESO', '1r-2n ESO'], ['B', 'ESO', '3r-4t ESO'], ['C', 'MAT', 'Batx. MAT'], ['C', 'MACS', 'Batx. MACS']].map(([n, it, t]) =>
          `<button type="button" data-n="${n}" data-it="${it}" class="${estat.nivell === n && (n !== 'C' || estat.itinerari === it) ? 'triat' : ''}">${t}</button>`).join('')}
      </div>` : ''}
      <footer>
        ${estat.convidat ? '' : '<button type="button" class="secundari" data-a="desar">Desar ara</button>'}
        <button type="button" class="secundari" data-a="sortir">Sortir</button>
      </footer>
    </div>`;
  capa.hidden = false;
  if (!hud.enQuadern) { hud.enQuadern = true; hud.onPausa && hud.onPausa(true); }
  const tancar = () => { capa.hidden = true; capa.innerHTML = ''; hud.enQuadern = false; hud.onPausa && hud.onPausa(false); };
  capa.querySelector('.tancar').onclick = tancar;
  capa.onclick = (e) => { if (e.target === capa) tancar(); };
  capa.querySelectorAll('.nivells button').forEach((b) => (b.onclick = () => {
    estat.nivell = b.dataset.n; estat.itinerari = b.dataset.n === 'C' ? b.dataset.it : 'ESO';
    hud.actualitzar(); obrirQuadern();
  }));
  capa.querySelector('[data-a="desar"]')?.addEventListener('click', () => { puntDeControl(); tancar(); });
  capa.querySelector('[data-a="sortir"]').onclick = async () => { await puntDeControl(); location.reload(); };
}
