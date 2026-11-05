/**
 * Operaciones vectoriales deterministas usadas por el análisis.
 * (Algoritmo propio de la plataforma, no forma parte del CC2020.)
 */

export function sum(values: readonly number[]): number {
  let s = 0;
  for (const v of values) s += v;
  return s;
}

/** Normaliza para que la suma sea 1. Si la suma es 0 devuelve un vector de ceros. */
export function normalizeToSum(values: readonly number[]): number[] {
  const total = sum(values);
  if (!(total > 0)) return values.map(() => 0);
  return values.map((v) => v / total);
}

export function dot(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length) throw new Error("Los vectores deben tener la misma longitud");
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function magnitude(a: readonly number[]): number {
  return Math.sqrt(dot(a, a));
}

/**
 * Similitud coseno entre dos vectores. Devuelve 0 si alguno es el vector cero.
 * Para vectores no negativos el resultado está en [0, 1].
 */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const ma = magnitude(a);
  const mb = magnitude(b);
  if (ma === 0 || mb === 0) return 0;
  const c = dot(a, b) / (ma * mb);
  // Evita errores de redondeo fuera de rango.
  return Math.min(1, Math.max(-1, c));
}

export function round(value: number, decimals = 0): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/**
 * Convierte proporciones (que suman 1) en porcentajes enteros que suman 100
 * usando el método del mayor residuo, para mostrar en pantalla sin descuadres.
 */
export function toPercentages(shares: readonly number[]): number[] {
  const total = sum(shares);
  if (!(total > 0)) return shares.map(() => 0);
  const raw = shares.map((s) => (s / total) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - sum(floors);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (const { i } of order) {
    if (remainder <= 0) break;
    floors[i] += 1;
    remainder -= 1;
  }
  return floors;
}

