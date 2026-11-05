import { CATEGORY_IDS, getCategory, type CategoryId } from "@/data/cc2020-areas";
import type { AnalysisResult } from "@/types";

export interface ComparedCareer {
  id: string;
  label: string;
  result: AnalysisResult;
}

/** Diferencia mínima (en puntos porcentuales) para considerar un énfasis distinto. */
export const COMPARISON_THRESHOLD = 0.05;

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Ejes de comparación solicitados, asociados a categorías CC2020. */
export const COMPARISON_DIMENSIONS: { id: string; label: string; categories: CategoryId[] }[] = [
  { id: "hw", label: "Enfoque hacia hardware", categories: ["HW"] },
  { id: "sd", label: "Desarrollo de software", categories: ["SD"] },
  { id: "sai", label: "Infraestructura y sistemas", categories: ["SAI"] },
  { id: "org", label: "Orientación hacia organizaciones", categories: ["UO", "SM"] },
  { id: "sf", label: "Fundamentos de computación", categories: ["SF"] },
];

export function dimensionValue(result: AnalysisResult, cats: CategoryId[]): number {
  return result.categories.filter((c) => cats.includes(c.category)).reduce((s, c) => s + c.share, 0);
}

/**
 * Genera afirmaciones comparativas basadas exclusivamente en los resultados
 * calculados. Nunca se habla de calidad, solo de énfasis curricular relativo.
 */
export function compareCareers(careers: readonly ComparedCareer[]): string[] {
  if (careers.length < 2) return [];
  const statements: string[] = [];
  for (const cat of CATEGORY_IDS) {
    const values = careers.map((c) => ({
      label: c.label,
      v: c.result.categories.find((x) => x.category === cat)?.share ?? 0,
    }));
    const max = values.reduce((a, b) => (b.v > a.v ? b : a));
    const min = values.reduce((a, b) => (b.v < a.v ? b : a));
    if (max.v - min.v >= COMPARISON_THRESHOLD) {
      const name = getCategory(cat).nameEs.toLowerCase();
      statements.push(
        `«${max.label}» presenta una proporción mayor de ${name} (${pct(max.v)}) que «${min.label}» (${pct(min.v)}).`,
      );
    }
  }
  if (statements.length === 0) {
    statements.push(
      "Las carreras seleccionadas tienen distribuciones muy parecidas: ninguna categoría difiere en 5 puntos porcentuales o más.",
    );
  }
  return statements;
}

