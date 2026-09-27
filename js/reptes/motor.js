// ─────────────────────────────────────────────────────────────
// MOTOR DE REPTES · mostra un repte, comprova la resposta i en retorna el registre
// Tipus implementats en aquest tall: R-NUM, R-PAS, R-TRI, R-CLA, R-TAU (04 §8)
// ─────────────────────────────────────────────────────────────
import { REPTES } from './generadors.js';
import { llegirNombre, iguals, barreja } from './util.js';
import { prepararCamp, crearTeclat, passarAlSeguent } from './teclat.js';

const NOM_NIVELL = { A: '1r-2n ESO', B: '3r-4t ESO', C: 'Batxillerat' };
const bonic = (s) => String(s).replace(/(^|[\s=(>:|])-(\d)/g, '$1−$2'); // guionet → signe menys

/**
 * Obre un repte. Retorna una promesa que es resol quan el jugador el tanca:
 * { registres: [...] }  — un registre per cada variant resolta o abandonada amb intents.
 */
export function obrirRepte(id, { nivell, itinerari }) {
  return new Promise((resoldre) => {
    const def = REPTES[id];
    const registres = [];
    const capa = document.getElementById('capa-repte');
    capa.hidden = false;
    let tancat = false;

    function nova() {
      const r = def.generar(nivell, itinerari);
      if (/[?&]prova\b/.test(location.search)) window.NUMERIA.ultimRepte = r;   // només per a proves automàtiques
      const est = { intents: 0, pistes: 0, inici: performance.now(), resolt: false };
      capa.innerHTML = '';
      const t = el('div', 'repte targeta');
      t.setAttribute('role', 'dialog');
      t.setAttribute('aria-modal', 'true');
      t.innerHTML = `
        <header class="repte-cap">
          <span class="rombe">◆</span>
          <h2>${def.titol}</h2>
          <span class="etiqueta">${r.saber}</span>
          <span class="etiqueta etiqueta-nivell">${NOM_NIVELL[nivell]}${nivell === 'C' ? ' · ' + itinerari : ''}</span>
        </header>
        <p class="enunciat">${bonic(r.enunciat)}</p>
        ${r.formula ? `<div class="formula">${bonic(r.formula)}</div>` : ''}`;
      const zona = el('div', 'zona');
      const retro = el('div', 'retro'); retro.setAttribute('aria-live', 'polite');
      const caixaPistes = el('div', 'pistes');
      const peu = el('footer', 'repte-peu');
      const bPista = boto('Pista (0/3)', 'secundari');
      const bOk = boto('Comprovar', 'principal');
      const bTancar = boto('Tancar', 'secundari');
      peu.append(bPista, bTancar, bOk);
      t.append(zona, retro, caixaPistes, peu);
      capa.appendChild(t);

      const tipus = RENDER[r.tipus](zona, r);   // { comprovar() → {ok, parcial, msg} }

      const comprovar = () => {
        if (est.resolt) return;
        const res = tipus.comprovar();
        if (res.buit) { avis(retro, res.msg || 'Falta alguna resposta.', 'info'); return; }
        est.intents++;
        if (res.ok) {
          est.resolt = true;
          avis(retro, `✓ Correcte! ${r.solucio ? '<span class="sol">' + bonic(r.solucio) + '</span>' : ''}`, 'be');
          t.classList.add('encert');
          registrar(true);
          bPista.hidden = true;
          bOk.textContent = 'Un altre';
          bOk.onclick = nova;
          teclatAmagat(t);
        } else if (res.parcial) {
          avis(retro, res.msg || 'Aquest pas és correcte. Continua.', 'be');
        } else {
          avis(retro, `✗ ${res.msg || 'No és correcte. Torna-ho a provar.'}`, 'malament');
          t.classList.remove('tremolor'); void t.offsetWidth; t.classList.add('tremolor');
        }
      };

      bOk.onclick = comprovar;
      bPista.onclick = () => {
        if (est.pistes >= 3) return;
        const p = el('p', 'pista');
        p.innerHTML = `<b>${['Orientació', 'Mètode', 'Exemple semblant'][est.pistes]}.</b> ${bonic(r.pistes[est.pistes])}`;
        caixaPistes.appendChild(p);
        est.pistes++;
        bPista.textContent = `Pista (${est.pistes}/3)`;
        if (est.pistes >= 3) bPista.disabled = true;
      };
      bTancar.onclick = () => { if (!est.resolt && est.intents > 0) registrar(false); tancar(); };
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); est.resolt ? nova() : comprovar(); }
        if (e.key === 'Escape') bTancar.click();
      });
      crearTeclat(t, () => (est.resolt ? nova() : comprovar()));
      setTimeout(passarAlSeguent, 30);

      function registrar(encert) {
        registres.push({
          repte: id, saber: r.saber, tipus: r.tipus, nivell, itinerari: nivell === 'C' ? itinerari : 'ESO',
          encert, intents: est.intents, pistes: est.pistes,
          temps_s: Math.round((performance.now() - est.inici) / 1000)
        });
      }
    }

    function tancar() {
      if (tancat) return; tancat = true;
      capa.hidden = true; capa.innerHTML = '';
      resoldre({ registres });
    }
    nova();
  });
}

// ═══════════════ Renderitzadors per tipus ═══════════════
const RENDER = {
  // R-NUM · entrada numèrica
  'R-NUM'(zona, r) {
    const ins = r.camps.map((c) => {
      const f = el('label', 'camp');
      f.innerHTML = `<span>${c.etiqueta}</span>`;
      const i = input(); f.appendChild(i);
      if (c.unitat) f.insertAdjacentHTML('beforeend', `<span class="unitat">${c.unitat}</span>`);
      zona.appendChild(f); return i;
    });
    return {
      comprovar() {
        const v = ins.map((i) => llegirNombre(i.value));
        if (ins.some((i) => i.value.trim() === '')) return { buit: true };
        if (v.some((x) => !Number.isFinite(x))) return { buit: true, msg: 'Escriu un nombre (pots fer servir coma decimal o una fracció a/b).' };
        const ok = r.camps.every((c, k) => iguals(v[k], c.valor, c.tol));
        if (ok) { ins.forEach((i) => (i.disabled = true)); return { ok }; }
        const e = (r.errors || []).find((er) => iguals(v[0], er.valor, 0.02));
        return { ok: false, msg: e?.msg };
      }
    };
  },

  // R-PAS · resolució per passos: un camp per pas, s'obren d'un en un
  'R-PAS'(zona, r) {
    let pas = 0;
    const files = r.passos.map((p, k) => {
      const f = el('label', 'camp pas');
      f.innerHTML = `<span>${bonic(p.etiqueta)}</span>`;
      const i = input(); f.appendChild(i);
      if (k > 0) f.classList.add('tancat');
      zona.appendChild(f); return { f, i };
    });
    files.forEach((x, k) => { if (k > 0) x.i.disabled = true; });
    return {
      comprovar() {
        const { f, i } = files[pas], p = r.passos[pas];
        if (i.value.trim() === '') return { buit: true };
        const v = llegirNombre(i.value);
        if (!Number.isFinite(v)) return { buit: true, msg: 'Escriu un nombre.' };
        if (!iguals(v, p.valor, p.tol)) {
          const msg = p.error && iguals(v, p.error.valor, 0.02) ? p.error.msg : 'Aquest pas no és correcte.';
          return { ok: false, msg };
        }
        i.disabled = true; f.classList.add('fet');
        pas++;
        if (pas >= files.length) return { ok: true };
        files[pas].f.classList.remove('tancat'); files[pas].i.disabled = false;
        setTimeout(passarAlSeguent, 10);
        return { parcial: true, msg: '✓ Pas correcte. Següent pas.' };
      }
    };
  },

  // R-TRI · triar una opció
  'R-TRI'(zona, r) {
    let sel = null;
    const llista = el('div', 'opcions');
    const bs = r.opcions.map((o, k) => {
      const b = boto(bonic(o), 'opcio');
      b.onclick = () => { bs.forEach((x) => x.classList.remove('triat')); b.classList.add('triat'); sel = k; };
      llista.appendChild(b); return b;
    });
    zona.appendChild(llista);
    return {
      comprovar() {
        if (sel === null) return { buit: true, msg: 'Tria una opció.' };
        if (sel === r.correcta) { bs[sel].classList.add('correcta'); bs.forEach((b) => (b.disabled = true)); return { ok: true }; }
        bs[sel].classList.add('errada'); bs[sel].disabled = true; bs[sel].classList.remove('triat'); sel = null;
        return { ok: false, msg: 'Aquesta no és la millor. Fes els comptes de cada opció.' };
      }
    };
  },

  // R-CLA · classificar: toca un element i després la caixa (funciona igual amb ratolí i amb el dit)
  'R-CLA'(zona, r) {
    let sel = null;
    const moll = el('div', 'moll'); moll.setAttribute('aria-label', 'Elements per classificar');
    const caixes = el('div', 'caixes');
    const cs = r.caixes.map((nom, k) => {
      const c = el('div', 'caixa'); c.innerHTML = `<h3>${nom}</h3><div class="dins"></div>`;
      c.tabIndex = 0;
      c.onclick = () => { if (sel) { c.querySelector('.dins').appendChild(sel); sel.dataset.caixa = k; sel.classList.remove('triat'); sel = null; } };
      caixes.appendChild(c); return c;
    });
    const fitxes = barreja(r.items).map((it) => {
      const f = boto(bonic(it.text), 'fitxa');
      f.dataset.bona = it.caixa;
      f.onclick = (e) => {
        e.stopPropagation();
        if (f.classList.contains('fixa')) return;
        if (f.parentElement !== moll) { moll.appendChild(f); delete f.dataset.caixa; return; } // torna al moll
        if (sel) sel.classList.remove('triat');
        sel = sel === f ? null : f; if (sel) f.classList.add('triat');
      };
      moll.appendChild(f); return f;
    });
    zona.append(moll, caixes);
    return {
      comprovar() {
        if (fitxes.some((f) => f.dataset.caixa === undefined)) return { buit: true, msg: 'Col·loca totes les caixes abans de comprovar.' };
        let mal = 0;
        fitxes.forEach((f) => {
          if (f.dataset.caixa === f.dataset.bona) f.classList.add('fixa');
          else { mal++; moll.appendChild(f); delete f.dataset.caixa; f.classList.add('errada'); setTimeout(() => f.classList.remove('errada'), 700); }
        });
        return mal === 0 ? { ok: true } : { ok: false, msg: `${mal} ${mal === 1 ? 'caixa no era al seu lloc i ha' : 'caixes no eren al seu lloc i han'} tornat al moll.` };
      }
    };
  },

  // R-TAU · omplir una taula
  'R-TAU'(zona, r) {
    const taula = el('table', 'taula');
    taula.innerHTML = `<thead><tr>${r.capcalera.map((c) => `<th>${c}</th>`).join('')}</tr></thead>`;
    const tb = el('tbody'); const camps = [];
    r.files.forEach((fila) => {
      const tr = el('tr');
      fila.forEach((cel) => {
        const td = el('td');
        if (cel && typeof cel === 'object') { const i = input(); i.setAttribute('aria-label', 'cel·la'); td.appendChild(i); camps.push({ i, cel }); }
        else td.textContent = cel;
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    taula.appendChild(tb);
    const embolcall = el('div', 'taula-embolcall'); embolcall.appendChild(taula);
    zona.appendChild(embolcall);
    return {
      comprovar() {
        const oberts = camps.filter((c) => !c.i.disabled);
        if (oberts.some((c) => c.i.value.trim() === '')) return { buit: true, msg: 'Omple totes les cel·les buides.' };
        let mal = 0;
        oberts.forEach(({ i, cel }) => {
          if (iguals(llegirNombre(i.value), cel.valor, cel.tol)) { i.disabled = true; i.classList.add('be'); i.classList.remove('mal'); }
          else { mal++; i.classList.add('mal'); }
        });
        if (mal === 0) return { ok: true };
        setTimeout(passarAlSeguent, 10);
        return { ok: false, msg: `Hi ha ${mal} ${mal === 1 ? 'cel·la' : 'cel·les'} per revisar (marcades en vermell). Les correctes ja queden fixades.` };
      }
    };
  }
};

// ═══════════════ petits ajudants DOM ═══════════════
function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function boto(txt, cls) { const b = el('button', cls); b.type = 'button'; b.innerHTML = txt; return b; }
function input() {
  const i = el('input'); i.type = 'text'; i.autocomplete = 'off'; i.setAttribute('inputmode', 'decimal'); i.spellcheck = false;
  prepararCamp(i); return i;
}
function avis(caixa, html, tipus) { caixa.className = 'retro ' + tipus; caixa.innerHTML = html; }
function teclatAmagat(t) { const k = t.querySelector('.teclat'); if (k) k.querySelectorAll('button:not(.tecla-ok)').forEach((b) => (b.disabled = true)); }
