import type { Subject, WeightingMethod } from "@/types";

export interface WeightingResult {
  method: WeightingMethod;
  /** subjectId → peso (créditos, horas o 1). */
  weights: Map<string, number>;
  total: number;
}

const isPositive = (v: number | null | undefined): v is number =>
  typeof v === "number" && Number.isFinite(v) && v > 0;

/**
 * Regla de ponderación (Paso 3 de la metodología):
 *  1. Créditos, si TODAS las materias tienen créditos válidos.
 *  2. Horas, si TODAS las materias tienen horas válidas.
 *  3. Peso uniforme (1 por materia) en cualquier otro caso.
 * Nunca se inventan créditos ni horas.
 */
export function chooseWeighting(subjects: readonly Subject[]): WeightingResult {
  let method: WeightingMethod = "uniform";
  if (subjects.length > 0 && subjects.every((s) => isPositive(s.credits))) method = "credits";
  else if (subjects.length > 0 && subjects.every((s) => isPositive(s.hours))) method = "hours";

  const weights = new Map<string, number>();
  let total = 0;
  for (const s of subjects) {
    const w = method === "credits" ? (s.credits as number) : method === "hours" ? (s.hours as number) : 1;
    weights.set(s.id, w);
    total += w;
  }
  return { method, weights, total };
}

export const WEIGHTING_LABELS: Record<WeightingMethod, string> = {
  credits: "por créditos",
  hours: "por horas",
  uniform: "uniforme (todas las materias valen lo mismo)",
};

