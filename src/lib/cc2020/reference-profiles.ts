import { AREA_IDS, CATEGORY_IDS, CC2020_AREAS, type CategoryId } from "@/data/cc2020-areas";
import { DISCIPLINE_IDS, TABLE_5_3, type DisciplineId } from "@/data/cc2020-reference";
import { normalizeToSum } from "@/lib/analysis/vector";

/**
 * PERFILES DE REFERENCIA (algoritmo de la plataforma basado en datos oficiales)
 * Para cada disciplina se toma el punto medio (min+max)/2 de cada una de las 34
 * áreas de la Tabla 5.3 y se normaliza el vector para que sume 1.
 */
export function referenceMidpoints(discipline: DisciplineId): number[] {
  const col = DISCIPLINE_IDS.indexOf(discipline);
  return AREA_IDS.map((id) => {
    const [min, max] = TABLE_5_3[id][col];
    return (min + max) / 2;
  });
}

export function referenceProfile(discipline: DisciplineId): number[] {
  return normalizeToSum(referenceMidpoints(discipline));
}

/** Agrupa un vector de 34 áreas (en el orden de AREA_IDS) en las 6 categorías. */
export function groupByCategory(areaVector: readonly number[]): Record<CategoryId, number> {
  const out = Object.fromEntries(CATEGORY_IDS.map((c) => [c, 0])) as Record<CategoryId, number>;
  CC2020_AREAS.forEach((area, i) => {
    out[area.category] += areaVector[i] ?? 0;
  });
  return out;
}

export function referenceCategoryShares(discipline: DisciplineId): Record<CategoryId, number> {
  return groupByCategory(referenceProfile(discipline));
}

export const REFERENCE_PROFILES: Record<DisciplineId, number[]> = Object.fromEntries(
  DISCIPLINE_IDS.map((d) => [d, referenceProfile(d)]),
) as Record<DisciplineId, number[]>;

