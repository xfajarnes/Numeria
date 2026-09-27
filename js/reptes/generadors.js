// ─────────────────────────────────────────────────────────────
// GENERADORS DELS REPTES D'EQUATIA (Al-Gerba, franja A)
// Cada repte té variant A (1r-2n ESO), B (3r-4t ESO) i C (Batxillerat).
// La història és la mateixa per a tothom; només canvia el contingut (04 §7).
// Cada generador retorna un objecte "repte" que el motor sap mostrar i comprovar.
// ─────────────────────────────────────────────────────────────
import { ri, tria, barreja, arrod, fmt, cor } from './util.js';

const sig = (n) => (n < 0 ? ` − ${-n}` : ` + ${n}`);           // " + 3" o " − 3"
const coef = (a, v) => (a === 1 ? v : a === -1 ? `−${v}` : `${fmt(a)}${v}`);
const terme = (a, v) => (a < 0 ? ' − ' : ' + ') + (Math.abs(a) === 1 ? '' : Math.abs(a)) + v; // " − 2y", " + z"
function polQuad(a, b, c) {                                      // a x² + b x + c amb signes nets
  let s = a === 1 ? 'x²' : a === -1 ? '−x²' : `${a}x²`;
  if (b) s += b === 1 ? ' + x' : b === -1 ? ' − x' : `${sig(b)}x`;
  if (c) s += sig(c);
  return s;
}

// ═══════════════ 1 · QÀSIM · R-NUM · percentatges (AG1) ═══════════════
function qasim(nivell) {
  if (nivell === 'A') {
    const P = ri(4, 40) * 5, p = tria([5, 10, 15, 20, 25, 30, 40]), puja = Math.random() < 0.5;
    const F = P * (1 + (puja ? p : -p) / 100);
    return {
      saber: 'E-NUM-44', tipus: 'R-NUM',
      enunciat: `Aquest contracte diu que una peça de seda costava <b>${cor(P)}</b> i que el preu ${puja ? 'ha <b>pujat</b>' : 'ha <b>baixat</b>'} un <b>${p} %</b>. Quin és el preu correcte ara?`,
      camps: [{ etiqueta: 'Preu nou', unitat: 'Cr', valor: F, tol: 0.01 }],
      errors: [
        { valor: P * p / 100, msg: `Això és només quant ${puja ? 'puja' : 'baixa'}. Falta aplicar-ho al preu inicial.` },
        { valor: P * (1 + (puja ? -p : p) / 100), msg: `Compte amb el sentit: el preu ${puja ? 'puja' : 'baixa'}.` }
      ],
      pistes: [
        'Et demanen el preu després del canvi, no només quant canvia.',
        `Multiplica el preu per ${puja ? `1 + ${p}/100` : `1 − ${p}/100`}, és a dir, per ${fmt(1 + (puja ? p : -p) / 100)}.`,
        'Exemple semblant: 80 Cr que baixen un 25 % → 80 · 0,75 = 60 Cr.'
      ],
      solucio: `${cor(P)} · ${fmt(1 + (puja ? p : -p) / 100)} = ${cor(F)}`
    };
  }
  if (nivell === 'B') {
    const P0 = ri(2, 12) * 40, a = tria([10, 20, 25, 30, 50]), b = tria([10, 20, 25, 40]);
    const F = P0 * (1 + a / 100) * (1 - b / 100);
    return {
      saber: 'E-NUM-45', tipus: 'R-NUM',
      enunciat: `Segons el contracte, el preu d'una balança de llautó es va <b>apujar un ${a} %</b> i després es va <b>rebaixar un ${b} %</b>. Ara costa <b>${cor(F)}</b>. Quin era el preu inicial?`,
      camps: [{ etiqueta: 'Preu inicial', unitat: 'Cr', valor: P0, tol: 0.05 }],
      errors: [
        { valor: F / (1 + (a - b) / 100), msg: 'Els percentatges encadenats no se sumen ni es resten: cal multiplicar els factors.' },
        { valor: F * (1 - a / 100) * (1 + b / 100), msg: 'Per desfer un augment no es resta el mateix percentatge: es divideix pel factor.' }
      ],
      pistes: [
        'Pensa en el preu inicial com una incògnita i en els dos canvis com dos factors que la multipliquen.',
        `Preu inicial · ${fmt(1 + a / 100)} · ${fmt(1 - b / 100)} = ${fmt(F)}. Divideix per aquests dos factors.`,
        'Exemple semblant: puja un 20 % i baixa un 50 %, i ara val 30 → x · 1,2 · 0,5 = 30 → x = 50.'
      ],
      solucio: `${fmt(F)} : (${fmt(1 + a / 100)} · ${fmt(1 - b / 100)}) = ${cor(P0)}`
    };
  }
  // C · interès compost (B-NUM-06)
  const C0 = ri(2, 20) * 500, r = tria([2, 2.5, 3, 3.5, 4, 5]), n = ri(3, 8);
  const Cf = arrod(C0 * (1 + r / 100) ** n, 2);
  return {
    saber: 'B-NUM-06', tipus: 'R-NUM',
    enunciat: `Qàsim va deixar <b>${cor(C0)}</b> en un dipòsit al <b>${fmt(r)} % anual</b> d'interès compost, amb capitalització anual. El contracte diu que al cap de <b>${n} anys</b> li tornaran una quantitat. Quina ha de ser? (arrodoneix als cèntims)`,
    camps: [{ etiqueta: 'Capital final', unitat: 'Cr', valor: Cf, tol: 0.02 }],
    errors: [{ valor: C0 * (1 + r * n / 100), msg: 'Això seria interès simple. En el compost, els interessos també generen interessos.' }],
    pistes: [
      'Cada any el capital es multiplica pel mateix factor.',
      `C = ${fmt(C0)} · (1 + ${fmt(r)}/100)^${n}`,
      'Exemple semblant: 1.000 Cr al 10 % durant 2 anys → 1.000 · 1,1² = 1.210 Cr.'
    ],
    solucio: `${fmt(C0)} · ${fmt(1 + r / 100, 3)}^${n} = ${cor(Cf)}`
  };
}

// ═══════════════ 2 · TOMBA DE DIOFANT · R-PAS · equacions (AG3) ═══════════════
function tomba(nivell) {
  if (nivell === 'A') {
    const x = ri(2, 15), a = ri(2, 9); let b = ri(-20, 30); if (b === 0) b = 7;
    const c = a * x + b;
    return {
      saber: 'E-ALG-15', tipus: 'R-PAS',
      enunciat: `Sota l'epitafi de Diofant, algú ha gravat un missatge nou: <i>«Pren el nombre del dia de la reunió, multiplica'l per ${a} i ${b > 0 ? `suma-hi ${b}` : `resta'n ${-b}`}: obtindràs ${c}.»</i>`,
      formula: `${a}x${sig(b)} = ${c}`,
      passos: [
        { etiqueta: `Deixa sol el terme amb x:  ${a}x =`, valor: c - b, tol: 0.001, error: { valor: c + b, msg: `Per treure ${b > 0 ? 'una suma' : 'una resta'}, fes l'operació contrària als dos costats.` } },
        { etiqueta: 'x =', valor: x, tol: 0.001, error: { valor: (c - b) * a, msg: 'Si x està multiplicada, cal dividir.' } }
      ],
      pistes: [
        "Desfés les operacions en l'ordre invers: primer la suma o la resta, després el producte.",
        `${b > 0 ? `Resta ${b}` : `Suma ${-b}`} als dos costats. Després divideix els dos costats per ${a}.`,
        'Exemple semblant: 3x + 4 = 19 → 3x = 15 → x = 5.'
      ],
      solucio: `${a}x = ${c - b} → x = ${x}`
    };
  }
  if (nivell === 'B') {
    let r1 = ri(-9, 9), r2 = ri(-9, 9);
    while (r1 === r2 || (r1 === 0 && r2 === 0)) r2 = ri(-9, 9);
    const B = -(r1 + r2), C = r1 * r2;
    return {
      saber: 'E-ALG-22', tipus: 'R-PAS',
      enunciat: "Sota l'epitafi de Diofant, el missatge del Cercle amaga dues xifres: les solucions d'aquesta equació.",
      formula: `${polQuad(1, B, C)} = 0`,
      passos: [
        { etiqueta: 'Discriminant  Δ = b² − 4ac =', valor: B * B - 4 * C, tol: 0.001, error: { valor: B * B + 4 * C, msg: 'Compte amb el signe de c: Δ = b² − 4·a·c.' } },
        { etiqueta: 'La solució més gran  x₁ =', valor: Math.max(r1, r2), tol: 0.001 },
        { etiqueta: 'La solució més petita  x₂ =', valor: Math.min(r1, r2), tol: 0.001 }
      ],
      pistes: [
        "Fes servir la fórmula de l'equació de segon grau. Comença pel discriminant.",
        'Δ = b² − 4ac, i després x = (−b ± √Δ) / 2a.',
        'Exemple semblant: x² − 5x + 6 = 0 → Δ = 25 − 24 = 1 → x = (5 ± 1)/2 → 3 i 2.'
      ],
      solucio: `Δ = ${B * B - 4 * C}; x = ${Math.max(r1, r2)} i ${Math.min(r1, r2)}`
    };
  }
  // C · sistema esglaonat per Gauss (B-ALG-04)
  const x = ri(-5, 6), y = ri(-5, 6), z = ri(-4, 5);
  const a = tria([1, 2, -1, 3]), b = tria([1, -1, 2, -2]), c = tria([1, 2, -1, 3]), k = tria([2, 3, -2, 4, 5]);
  const d1 = x + a * y + b * z, d2 = y + c * z, d3 = k * z;
  return {
    saber: 'B-ALG-04', tipus: 'R-PAS',
    enunciat: "El missatge del Cercle és un sistema de tres equacions. Algú ja l'ha esglaonat pel mètode de Gauss. Troba les tres xifres.",
    formula: `x${terme(a, 'y')}${terme(b, 'z')} = ${d1}<br>y${terme(c, 'z')} = ${d2}<br>${k}z = ${d3}`,
    passos: [
      { etiqueta: 'z =', valor: z, tol: 0.001 },
      { etiqueta: 'y =', valor: y, tol: 0.001 },
      { etiqueta: 'x =', valor: x, tol: 0.001 }
    ],
    pistes: [
      "Comença per l'última equació: només hi ha z.",
      'Substitueix z a la segona per trobar y. Després substitueix y i z a la primera.',
      'Exemple semblant: 2z = 6 → z = 3; y + z = 5 → y = 2; x + y + z = 6 → x = 1.'
    ],
    solucio: `z = ${z}, y = ${y}, x = ${x}`
  };
}

// ═══════════════ 3 · VENEDORA DE DÀTILS · R-TRI · qualitat-preu ═══════════════
function venedora(nivell) {
  if (nivell === 'A') {
    let packs;
    do {
      const pesos = barreja([250, 400, 500, 750, 1000]).slice(0, 3);
      packs = pesos.map((g) => ({ g, p: arrod(g / 1000 * (ri(60, 140) / 10), 1) }));
      packs.forEach((k) => (k.kg = k.p / (k.g / 1000)));
      const ord = [...packs].sort((u, v) => u.kg - v.kg);
      if (ord[1].kg - ord[0].kg > 0.4) break;
    } while (true);
    const millor = packs.reduce((m, k, i) => (k.kg < packs[m].kg ? i : m), 0);
    return {
      saber: 'E-NUM-50', tipus: 'R-TRI',
      enunciat: 'Tres capses de dàtils, tres preus. Quina surt <b>més barata per quilo</b>?',
      opcions: packs.map((k) => `Capsa de ${k.g} g · ${cor(k.p)}`),
      correcta: millor,
      pistes: [
        'No miris només el preu: les capses no pesen igual.',
        'Calcula quant costaria 1 kg (1.000 g) de cada capsa i compara.',
        'Exemple semblant: 500 g a 4 Cr → 1 kg a 8 Cr; 250 g a 2,5 Cr → 1 kg a 10 Cr. La primera és més barata.'
      ],
      solucio: packs.map((k) => `${k.g} g → ${cor(k.kg)}/kg`).join(' · ')
    };
  }
  if (nivell === 'B') {
    let n, P, ofertes, ord;
    do {
      n = ri(2, 4); P = ri(3, 12);
      const totes = [
        { t: '3×2 (compres tres i en pagues dues)', f: () => P * (n - Math.floor(n / 3)) },
        { t: '−30 % en tota la compra', f: () => n * P * 0.7 },
        { t: 'La segona unitat a meitat de preu', f: () => P * (n - Math.floor(n / 2) * 0.5) },
        { t: '−20 % i, a sobre, un −15 % més', f: () => n * P * 0.8 * 0.85 },
        { t: '−10 % i, a sobre, un −25 % més', f: () => n * P * 0.9 * 0.75 }
      ];
      ofertes = barreja(totes).slice(0, 3).map((o) => ({ t: o.t, v: arrod(o.f(), 2) }));
      ord = [...ofertes].sort((u, v) => u.v - v.v);
    } while (ord[1].v - ord[0].v < 0.05);
    return {
      saber: 'E-NUM-45', tipus: 'R-TRI',
      enunciat: `Cada capsa de dàtils val <b>${cor(P)}</b> i en vols comprar <b>${n}</b>. La venedora t'ofereix tres ofertes. Quina et surt <b>més barata</b>?`,
      opcions: ofertes.map((o) => o.t),
      correcta: ofertes.indexOf(ord[0]),
      pistes: [
        `Calcula el preu total de les ${n} capses amb cada oferta.`,
        'Dos descomptes seguits es multipliquen: −20 % i −15 % → · 0,8 · 0,85, que no és el mateix que −35 %.',
        'Exemple semblant: 3 capses de 10 Cr amb −10 % i −10 % → 30 · 0,9 · 0,9 = 24,3 Cr.'
      ],
      solucio: ofertes.map((o) => `${o.t}: ${cor(o.v)}`).join(' · ')
    };
  }
  // C · comparar dipòsits (B-NUM-06)
  let C0, n, op, ord;
  do {
    C0 = ri(4, 20) * 500; n = ri(3, 10);
    const r1 = tria([3, 3.5, 4, 4.5]), r2 = arrod(r1 - tria([0.1, 0.2, 0.3]), 1), r3 = arrod(r1 + tria([0.3, 0.5, 0.8]), 1);
    op = [
      { t: `${fmt(r1)} % anual, capitalització anual`, v: C0 * (1 + r1 / 100) ** n },
      { t: `${fmt(r2)} % anual, capitalització mensual`, v: C0 * (1 + r2 / 1200) ** (12 * n) },
      { t: `${fmt(r3)} % anual d'interès simple`, v: C0 * (1 + r3 * n / 100) }
    ];
    op = barreja(op);
    ord = [...op].sort((u, v) => v.v - u.v);
  } while (ord[0].v - ord[1].v < 2);
  return {
    saber: 'B-NUM-06', tipus: 'R-TRI',
    enunciat: `La venedora vol invertir <b>${cor(C0)}</b> durant <b>${n} anys</b>. Tres cases de canvi del Basar li ofereixen aquests dipòsits. Quin li dona <b>més diners</b> al final?`,
    opcions: op.map((o) => o.t),
    correcta: op.indexOf(ord[0]),
    pistes: [
      'Calcula el capital final de cada opció: no es pot decidir només mirant el tipus.',
      'Compost anual: C(1 + r)^n. Compost mensual: C(1 + r/12)^(12n). Simple: C(1 + r·n).',
      "Exemple semblant: 1.000 Cr, 2 anys al 10 %: compost 1.210 Cr; simple 1.200 Cr."
    ],
    solucio: op.map((o) => `${o.t}: ${cor(o.v)}`).join(' · ')
  };
}

// ═══════════════ 4 · LEO SUMMI · R-CLA · classificar la càrrega ═══════════════
function leo(nivell) {
  let caixes, items;
  if (nivell === 'A') {
    caixes = ['Expressió algebraica', 'Equació', 'Igualtat numèrica'];
    const e = () => { const a = ri(2, 9), b = ri(1, 9); return tria([`${a}x + ${b}`, `${a}·(x − ${b})`, `x² + ${a}`, `${a}y − ${b}x`, `${a}x − ${b}y + 1`]); };
    const q = () => { const a = ri(3, 9), b = ri(2, a - 1), c = ri(10, 40); return tria([`${a}x + ${b} = ${c}`, `x − ${b} = ${a}`, `${a}x = ${b}x + ${c}`, `${a}·(x + 1) = ${c}`]); };
    const n = () => { const a = ri(2, 12), b = ri(2, 12); return tria([`${a} + ${b} = ${a + b}`, `${a} · ${b} = ${a * b}`, `${a}² = ${a * a}`, `${a * b} : ${b} = ${a}`]); };
    items = [0, 0, 1, 1, 2, 2].map((k) => ({ text: [e, q, n][k](), caixa: k }));
    return {
      saber: 'E-ALG-06', tipus: 'R-CLA', caixes, items: dedup(items, [e, q, n]),
      enunciat: 'Leo ha de carregar les caixes a les tres bodegues del vaixell, però les etiquetes s\'han barrejat. Cada caixa porta una expressió. Posa cada caixa a la bodega que toca.',
      pistes: [
        'Fixa\'t en dues coses: hi ha lletres? hi ha un signe =?',
        'Equació: lletres i un =. Expressió: lletres però cap =. Igualtat numèrica: un = però només nombres.',
        'Exemple: 3x + 2 → expressió; 3x + 2 = 8 → equació; 3 + 2 = 5 → igualtat numèrica.'
      ],
      solucio: 'Mira si hi ha lletres i si hi ha un signe =.'
    };
  }
  if (nivell === 'B') {
    caixes = ['Dues solucions', 'Una solució', 'Cap solució'];
    const dos = () => { let r1 = ri(-7, 7), r2 = ri(-7, 7); while (r1 === r2) r2 = ri(-7, 7); return `${polQuad(1, -(r1 + r2), r1 * r2)} = 0`; };
    const un = () => { const r = ri(-6, 6) || 3; return `${polQuad(1, -2 * r, r * r)} = 0`; };
    const cap = () => { const b = ri(-6, 6); const c = Math.floor(b * b / 4) + ri(1, 9); return `${polQuad(1, b, c)} = 0`; };
    items = [0, 0, 1, 1, 2, 2].map((k) => ({ text: [dos, un, cap][k](), caixa: k }));
    return {
      saber: 'E-ALG-22', tipus: 'R-CLA', caixes, items: dedup(items, [dos, un, cap]),
      enunciat: 'Leo classifica la càrrega segons quantes solucions té l\'equació de cada caixa. No cal resoldre-les: n\'hi ha prou de saber quantes solucions tenen.',
      pistes: [
        'Hi ha un nombre que decideix quantes solucions té una equació de segon grau.',
        'Calcula Δ = b² − 4ac. Si Δ > 0, dues; si Δ = 0, una; si Δ < 0, cap.',
        'Exemple: x² + 2x + 5 = 0 → Δ = 4 − 20 = −16 < 0 → cap solució.'
      ],
      solucio: 'Classifica pel signe del discriminant.'
    };
  }
  caixes = ['Polinòmica', 'Racional', 'Irracional', 'Exponencial'];
  const p = () => { const a = ri(2, 6), b = ri(1, 9); return tria([`x³ − ${a}x² + ${b} = 0`, `x⁴ − ${a * a}x² = 0`, `(x − ${a})(x + ${b}) = x²`]); };
  const r = () => { const a = ri(2, 6), b = ri(1, 9); return tria([`${a}/(x − ${b}) = x`, `x/(x + ${a}) = ${b}`, `1/x + 1/(x − ${a}) = ${b}`]); };
  const ir = () => { const a = ri(2, 9), b = ri(1, 9); return tria([`√(x + ${a}) = x − ${b}`, `√(${a}x) + ${b} = x`, `x − √x = ${a * (a - 1)}`]); };
  const ex = () => { const a = ri(2, 5), b = ri(2, 4); return tria([`${a}^x = ${a ** b}`, `${a}^(x + 1) = ${a ** (b + 1)}`, `${a}^x + ${a}^(x+1) = ${a ** b * (a + 1)}`]); };
  items = [0, 0, 1, 1, 2, 2, 3, 3].map((k) => ({ text: [p, r, ir, ex][k](), caixa: k }));
  return {
    saber: 'B-ALG-01', tipus: 'R-CLA', caixes, items: dedup(items, [p, r, ir, ex]),
    enunciat: 'Leo classifica la càrrega segons el tipus d\'equació de cada caixa. Cada tipus es resol amb una tècnica diferent, i cada bodega té les eines d\'una tècnica.',
    pistes: [
      'Mira on és la x: dins d\'una arrel, en un denominador, en un exponent o només en potències naturals.',
      'x en un denominador → racional. x dins d\'una arrel → irracional. x a l\'exponent → exponencial. Si no, polinòmica.',
      'Exemple: √(x + 1) = 3 → irracional; 2^x = 8 → exponencial; 1/x = 4 → racional.'
    ],
    solucio: 'Mira on apareix la x.'
  };
}
function dedup(items, gens) {                                     // evita dues caixes idèntiques
  const vist = new Set();
  return items.map((it) => { let t = it.text, i = 0; while (vist.has(t) && i++ < 20) t = gens[it.caixa](); vist.add(t); return { ...it, text: t }; });
}

// ═══════════════ 5 · EMILIANA RHO · R-TAU · la factura de la Tresorera ═══════════════
function emiliana(nivell) {
  if (nivell === 'A') {
    const prod = barreja(['Rotlles de paper', 'Tinta de coure', 'Segells de cera', 'Plomes de ferro', 'Cordes de cànem']).slice(0, 3);
    const linies = prod.map((n) => ({ n, q: ri(2, 12), p: ri(3, 40) / 2 }));
    const taxa = tria([5, 8, 10]);
    const sub = linies.reduce((s, l) => s + l.q * l.p, 0), imp = arrod(sub * taxa / 100, 2), tot = arrod(sub + imp, 2);
    const T = (v) => ({ valor: v, tol: 0.01 });
    return {
      saber: 'E-NUM-51', tipus: 'R-TAU',
      enunciat: `La Tresorera Reial vol que revisis aquesta factura de la Corona. Omple els forats. <span class="llavor">Destinatari: ________</span>`,
      capcalera: ['Concepte', 'Quantitat', 'Preu unitari', 'Import'],
      files: [
        ...linies.map((l) => [l.n, String(l.q), cor(l.p), T(l.q * l.p)]),
        ['Subtotal', '', '', T(sub)],
        [`Taxa del port (${taxa} %)`, '', '', T(imp)],
        ['Total', '', '', T(tot)]
      ],
      pistes: [
        "Cada import és quantitat per preu. El subtotal és la suma dels imports.",
        `La taxa és el ${taxa} % del subtotal. El total és el subtotal més la taxa.`,
        'Exemple: 4 plomes a 2,5 Cr → 10 Cr. Subtotal de 50 Cr amb taxa del 10 % → 5 Cr; total 55 Cr.'
      ],
      solucio: `Subtotal ${cor(sub)} · taxa ${cor(imp)} · total ${cor(tot)}`
    };
  }
  const C0 = ri(4, 30) * 100, r = tria([2, 2.5, 3, 4, 5, 6]), T = (v) => ({ valor: v, tol: 0.05 });
  const files = []; let C = C0;
  for (let any = 1; any <= 3; any++) {
    const i = nivell === 'B' ? arrod(C0 * r / 100, 2) : arrod(C * r / 100, 2);
    C = arrod(C + i, 2);
    files.push([String(any), T(i), T(C)]);
  }
  const compost = nivell === 'C';
  return {
    saber: compost ? 'B-NUM-06' : 'E-NUM-52', tipus: 'R-TAU',
    enunciat: `La Corona va prestar <b>${cor(C0)}</b> a un mercader d'Equatia al <b>${fmt(r)} % anual</b> d'interès <b>${compost ? 'compost' : 'simple'}</b>. Emiliana vol la taula dels tres primers anys${compost ? ' (arrodoneix als cèntims cada any)' : ''}.`,
    capcalera: ['Any', "Interès de l'any", 'Deute acumulat'],
    files,
    pistes: compost
      ? ["En l'interès compost, cada any l'interès es calcula sobre el deute acumulat de l'any anterior.", `Interès de l'any = deute anterior · ${fmt(r)}/100. Deute nou = deute anterior + interès.`, 'Exemple: 1.000 Cr al 10 % → any 1: 100 i 1.100; any 2: 110 i 1.210.']
      : ["En l'interès simple, cada any es paga el mateix interès.", `Interès de cada any = ${fmt(C0)} · ${fmt(r)}/100. Després ves sumant.`, 'Exemple: 1.000 Cr al 10 % → 100 Cr cada any: 1.100, 1.200, 1.300.'],
    solucio: files.map((f) => `any ${f[0]}: ${cor(f[1].valor)} → ${cor(f[2].valor)}`).join(' · ')
  };
}

// Registre dels reptes del tall. La clau és l'id del punt de repte al mapa.
export const REPTES = {
  qasim:    { titol: 'Els preus impossibles', tipus: 'R-NUM', generar: qasim },
  tomba:    { titol: "L'epitafi", tipus: 'R-PAS', generar: tomba },
  venedora: { titol: 'La capsa més barata', tipus: 'R-TRI', generar: venedora },
  leo:      { titol: 'La càrrega de Leo', tipus: 'R-CLA', generar: leo },
  emiliana: { titol: 'La factura de la Tresorera', tipus: 'R-TAU', generar: emiliana }
};
