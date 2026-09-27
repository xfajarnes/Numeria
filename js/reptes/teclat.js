// Teclat numèric propi per a pantalles tàctils (04 §8, R-NUM en mòbil).
// Al PC no surt: es fa servir el teclat físic.

export const esTactil = () => window.matchMedia('(pointer: coarse)').matches;

let actiu = null;           // l'<input> que rep les tecles
let enComprovar = null;     // què fa la tecla ✓

export function prepararCamp(input) {
  if (!esTactil()) return;
  input.readOnly = true;            // evita que surti el teclat del sistema
  input.setAttribute('inputmode', 'none');
  input.addEventListener('pointerdown', () => marcar(input));
  if (!actiu || !document.body.contains(actiu) || actiu.disabled) marcar(input);
}

function marcar(input) {
  if (actiu) actiu.classList.remove('camp-actiu');
  actiu = input;
  input.classList.add('camp-actiu');
}

export function crearTeclat(contenidor, comprovar) {
  enComprovar = comprovar;
  if (!esTactil()) return;
  const tecles = ['7', '8', '9', '/', '4', '5', '6', '−', '1', '2', '3', ',', '0', '⌫', '✓'];
  const t = document.createElement('div');
  t.className = 'teclat';
  for (const k of tecles) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = k;
    if (k === '✓') { b.className = 'tecla-ok'; b.style.gridColumn = 'span 2'; }
    b.addEventListener('click', () => premer(k));
    t.appendChild(b);
  }
  contenidor.appendChild(t);
}

function premer(k) {
  if (k === '✓') return enComprovar && enComprovar();
  if (!actiu || actiu.disabled || !document.body.contains(actiu)) {
    const seg = document.querySelector('.repte input:not([disabled])');
    if (!seg) return; marcar(seg);
  }
  if (k === '⌫') actiu.value = actiu.value.slice(0, -1);
  else actiu.value += k;
}

// Quan un camp es resol, el teclat passa al següent camp buit.
export function passarAlSeguent() {
  const seg = [...document.querySelectorAll('.repte input:not([disabled])')].find((i) => i.value === '')
    || document.querySelector('.repte input:not([disabled])');
  if (seg && esTactil()) marcar(seg);
  else if (seg) seg.focus();
}
