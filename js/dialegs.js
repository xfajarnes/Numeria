// ─────────────────────────────────────────────────────────────
// DIÀLEGS · lectura del format de text pla i quadre de diàleg (07 §9)
// ─────────────────────────────────────────────────────────────
import { ILLES } from './art/paleta.js';

let BLOCS = {};

export async function carregarDialegs(url = 'dades/dialegs.txt') {
  const txt = await (await fetch(url, { cache: 'no-cache' })).text();
  BLOCS = llegir(txt);
}

export function llegir(txt) {
  const blocs = {}; let actual = null;
  for (const brut of txt.split(/\r?\n/)) {
    const l = brut.trim();
    if (!l || l.startsWith('#')) continue;
    const cap = l.match(/^==\s*(.+?)\s*==$/);
    if (cap) { actual = blocs[cap[1]] = { linies: [], repte: null }; continue; }
    if (!actual) continue;
    const r = l.match(/^>>\s*repte\s+(\S+)/);
    if (r) { actual.repte = r[1]; continue; }
    const m = l.match(/^([^:]{2,40}):\s+(.*)$/);
    actual.linies.push(m && !/[.!?]$/.test(m[1]) ? { qui: m[1], text: m[2] } : { qui: null, text: l });
  }
  return blocs;
}

export const existeix = (id) => !!BLOCS[id];

// Mostra un bloc. Resol amb true si el jugador vol fer el repte del final.
export function mostrarDialeg(id, { nom = '', illa = 'algerba' } = {}) {
  const bloc = BLOCS[id];
  if (!bloc) return Promise.resolve(false);
  const capa = document.getElementById('capa-dialeg');
  const neo = ILLES[illa].neo;
  return new Promise((resoldre) => {
    let i = 0;
    capa.hidden = false;
    const pintar = () => {
      const l = bloc.linies[i];
      const ultima = i === bloc.linies.length - 1;
      const text = l.text.replace(/\{nom\}/g, nom);
      capa.innerHTML = `
        <div class="dialeg ${l.qui ? '' : 'narracio'}" role="dialog" aria-live="polite">
          ${l.qui ? `<div class="retrat" style="--neo:${neo}"><span>${inicials(l.qui)}</span></div>` : ''}
          <div class="dialeg-cos">
            ${l.qui ? `<div class="dialeg-nom" style="color:${neo}">${l.qui}</div>` : ''}
            <p>${text}</p>
            <div class="dialeg-accions">
              ${ultima && bloc.repte
                ? '<button type="button" class="secundari" data-a="no">Ara no</button><button type="button" class="principal" data-a="si">◆ Resoldre-ho</button>'
                : `<button type="button" class="principal" data-a="seg">${ultima ? 'Tancar' : 'Continuar ▸'}</button>`}
            </div>
          </div>
        </div>`;
      capa.querySelectorAll('button').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); accio(b.dataset.a); }));
      capa.querySelector('.principal').focus();
    };
    const accio = (a) => {
      if (a === 'seg' && i < bloc.linies.length - 1) { i++; pintar(); return; }
      tancar(a === 'si');
    };
    const tecla = (e) => {
      if (['Enter', ' ', 'e', 'E'].includes(e.key)) {
        e.preventDefault();
        const ultima = i === bloc.linies.length - 1;
        accio(ultima && bloc.repte ? 'si' : 'seg');
      } else if (e.key === 'Escape') tancar(false);
    };
    const tancar = (vol) => {
      window.removeEventListener('keydown', tecla, true);
      capa.hidden = true; capa.innerHTML = '';
      resoldre(vol);
    };
    // es deixa passar un instant perquè la mateixa tecla que obre el diàleg no el faci avançar
    setTimeout(() => window.addEventListener('keydown', tecla, true), 150);
    capa.onclick = () => { if (!bloc.repte || i < bloc.linies.length - 1) accio('seg'); };
    pintar();
  });
}

const inicials = (nom) => nom.split(/\s+/).filter((p) => /^[A-ZÀ-Ú]/.test(p)).slice(0, 2).map((p) => p[0]).join('');
