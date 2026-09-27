// Utilitats comunes dels generadors de reptes.

export const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1)); // enter entre a i b
export const tria = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const barreja = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
export const arrod = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

// Format català: coma decimal i com a molt 2 decimals.
export const fmt = (x, d = 2) => {
  const r = arrod(x, d);
  return (Number.isInteger(r) ? String(r) : r.toFixed(d).replace(/0+$/, '').replace(/\.$/, '')).replace('.', ',').replace('-', '−');
};
export const cor = (x) => fmt(x, 2) + ' Cr'; // Corones

// Llegeix una resposta numèrica: "12,5", "12.5", "3/4", "-2", "−2", "15 %", "1 234,5".
export function llegirNombre(txt) {
  if (txt == null) return NaN;
  let s = String(txt).trim().replace(/−/g, '-').replace(/\s/g, '').replace(/%$/, '').replace(/Cr$/i, '');
  if (s === '') return NaN;
  const f = s.match(/^(-?\d+(?:[.,]\d+)?)\/(-?\d+(?:[.,]\d+)?)$/);
  if (f) { const d = parseFloat(f[2].replace(',', '.')); return d === 0 ? NaN : parseFloat(f[1].replace(',', '.')) / d; }
  // "1.234,5" → 1234.5 ; "1,5" → 1.5 ; "1.5" → 1.5
  if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else s = s.replace(',', '.');
  if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
  return parseFloat(s);
}

export const iguals = (a, b, tol = 0.005) => Number.isFinite(a) && Math.abs(a - b) <= tol;
