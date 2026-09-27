// ─────────────────────────────────────────────────────────────
// ARRENCADA · genera l'art, llegeix els diàlegs, inicia la sessió i obre el joc
// ─────────────────────────────────────────────────────────────
import { CONFIG } from './config.js';
import { estat, nivellDeCurs, itinerariNet, partidaNova, carregarLocal, mesRecent, desarLocal } from './estat.js';
import { iniciarSessio, hiHaServidor, puntDeControl } from './xarxa.js';
import { carregarDialegs } from './dialegs.js';
import { generarTextures } from './art/peces.js';
import { Joc } from './escena-joc.js';

class Arrencada extends Phaser.Scene {
  constructor() { super('Arrencada'); }
  create() { generarTextures(this, 'algerba'); this.game.events.emit('textures-llestes'); }
}

const joc = new Phaser.Game({
  type: new URLSearchParams(location.search).has('canvas') ? Phaser.CANVAS : Phaser.AUTO,
  parent: 'joc',
  backgroundColor: '#151922',
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  render: { antialias: true, roundPixels: false },
  input: { activePointers: 3 },
  scene: [Arrencada, Joc]
});

const texturesLlestes = new Promise((r) => joc.events.once('textures-llestes', r));
const $ = (id) => document.getElementById(id);

Promise.all([texturesLlestes, carregarDialegs()]).then(mostrarInici).catch((e) => {
  $('capa-inici').innerHTML = `<div class="targeta inici"><h1>Numèria</h1><p class="error">No s'ha pogut carregar el joc: ${e.message}</p>
  <p class="nota">Si l'has obert fent doble clic a l'index.html, cal obrir-lo des d'una adreça web (GitHub Pages) o amb un servidor local.</p></div>`;
});

function mostrarInici() {
  const servidor = hiHaServidor();
  $('capa-inici').innerHTML = `
    <div class="targeta inici">
      <p class="sobretitol">Al-Gerba · Equatia</p>
      <h1>Numèria</h1>
      <p class="sub">Prova del primer tram jugable · v${CONFIG.VERSIO}</p>
      ${servidor ? `
      <form id="form-login" autocomplete="off">
        <label>Codi d'alumne<input id="in-codi" required maxlength="20" autocapitalize="characters"></label>
        <label>Contrasenya<input id="in-pass" type="password" required maxlength="40"></label>
        <p class="error" id="login-error" hidden></p>
        <button type="submit" class="principal">Entrar</button>
      </form>
      <div class="separador"><span>o bé</span></div>` : `
      <p class="nota">Encara no hi ha cap servidor configurat a <code>js/config.js</code>. Es pot jugar en mode convidat: el progrés es desa només en aquest navegador.</p>`}
      <div class="convidat">
        <label>Provar sense compte, amb el nivell:
          <select id="in-nivell">
            <option value="A|ESO">1r-2n ESO</option><option value="B|ESO">3r-4t ESO</option>
            <option value="C|MAT">Batxillerat · MAT</option><option value="C|MACS">Batxillerat · MACS</option>
          </select>
        </label>
        <button type="button" class="${servidor ? 'secundari' : 'principal'}" id="b-convidat">Jugar com a convidat</button>
      </div>
    </div>`;
  $('b-convidat').onclick = () => {
    const [n, it] = $('in-nivell').value.split('|');
    Object.assign(estat, { alumne: null, convidat: true, nivell: n, itinerari: it });
    const local = carregarLocal();
    local ? comencar(local) : crearPersonatge();
  };
  $('form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const codi = $('in-codi').value.trim().toUpperCase(), contrasenya = $('in-pass').value;
    const err = $('login-error'); err.hidden = true;
    const b = e.submitter || e.target.querySelector('button'); b.disabled = true; b.textContent = 'Connectant…';
    try {
      const r = await iniciarSessio(codi, contrasenya);
      const nivell = nivellDeCurs(r.curs);
      Object.assign(estat, { alumne: { codi, contrasenya }, convidat: false, nivell, itinerari: itinerariNet(r.itinerari, nivell) });
      const p = mesRecent(r.partida, carregarLocal());
      p ? comencar(p) : crearPersonatge();
    } catch (ex) {
      err.hidden = false;
      err.textContent = ex.servidor ? ex.message : 'No hi ha connexió amb el servidor. Torna-ho a provar o juga com a convidat.';
      b.disabled = false; b.textContent = 'Entrar';
    }
  });
}

function crearPersonatge() {
  const img = (base) => joc.textures.getBase64(`jug-${base}-davant`);
  $('capa-inici').innerHTML = `
    <div class="targeta inici">
      <p class="sobretitol">Viatger de l'Intercanvi</p>
      <h2>Qui arriba a Numèria?</h2>
      <label>Nom del personatge<input id="in-nom" maxlength="16" placeholder="Inventa'l"></label>
      <p class="nota">Fes servir un nom inventat, no el teu nom real: el joc no guarda noms de persones.</p>
      <div class="bases" role="radiogroup" aria-label="Aparença">
        ${['noi', 'noia', 'neutre'].map((b, i) => `<button type="button" role="radio" data-base="${b}" class="base ${i === 0 ? 'triat' : ''}" aria-checked="${i === 0}">
          <img src="${img(b)}" alt=""><span>${b === 'neutre' ? 'Neutre' : b[0].toUpperCase() + b.slice(1)}</span></button>`).join('')}
      </div>
      <p class="error" id="nom-error" hidden>Cal un nom per al personatge.</p>
      <button type="button" class="principal" id="b-crear">Començar</button>
    </div>`;
  let base = 'noi';
  document.querySelectorAll('.base').forEach((b) => (b.onclick = () => {
    document.querySelectorAll('.base').forEach((x) => { x.classList.remove('triat'); x.setAttribute('aria-checked', 'false'); });
    b.classList.add('triat'); b.setAttribute('aria-checked', 'true'); base = b.dataset.base;
  }));
  $('b-crear').onclick = () => {
    const nom = $('in-nom').value.trim();
    if (!nom) { $('nom-error').hidden = false; return; }
    comencar(partidaNova(nom, base));
  };
}

function comencar(partida) {
  estat.partida = partida;
  desarLocal();
  $('capa-inici').hidden = true;
  joc.scene.start('Joc');
  if (estat.alumne) puntDeControl();
}

// Accés des de la consola per provar (window.NUMERIA)
window.NUMERIA = { estat, joc };
