import { AREA_IDS, CATEGORY_IDS, getArea, type CategoryId } from "@/data/cc2020-areas";
import type { AreaResult, CategoryResult, Subject, SubjectClassification, SubjectContribution } from "@/types";
import { sanitizeAssignments } from "./sanitize";
import type { WeightingResult } from "./weighting";

export interface ProfileComputation {
  /** Puntajes sin normalizar en el orden de AREA_IDS. */
  rawScores: number[];
  /** Perfil normalizado (suma 1) en el orden de AREA_IDS. */
  profile: number[];
  areas: AreaResult[];
  categories: CategoryResult[];
  /** Suma de peso × relevancia de todas las materias. */
  classifiedWeight: number;
}

/**
 * Paso 4: Puntaje del área = Σ (peso de la materia × relevancia asignada).
 * Después se normaliza para obtener la distribución relativa del contenido clasificado.
 */
export function computeProfile(
  subjects: readonly Subject[],
  classifications: readonly SubjectClassification[],
  weighting: WeightingResult,
): ProfileComputation {
  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const index = new Map(AREA_IDS.map((id, i) => [id, i]));
  const rawScores = AREA_IDS.map(() => 0);
  const contributionsByArea: SubjectContribution[][] = AREA_IDS.map(() => []);

  for (const cls of classifications) {
    const subject = subjectById.get(cls.subjectId);
    if (!subject) continue;
    const w = weighting.weights.get(subject.id) ?? 0;
    for (const a of sanitizeAssignments(cls.assignments)) {
      const i = index.get(a.areaId);
      if (i === undefined) continue;
      const score = w * a.relevance;
      if (score <= 0) continue;
      rawScores[i] += score;
      contributionsByArea[i].push({
        subjectId: subject.id,
        subjectName: subject.name,
        score,
        share: 0,
        justification: a.justification,
      });
    }
  }

  const classifiedWeight = rawScores.reduce((s, v) => s + v, 0);
  const profile = rawScores.map((v) => (classifiedWeight > 0 ? v / classifiedWeight : 0));

  const areas: AreaResult[] = AREA_IDS.map((areaId, i) => {
    const contributions = contributionsByArea[i]
      .map((c) => ({ ...c, share: classifiedWeight > 0 ? c.score / classifiedWeight : 0 }))
      .sort((a, b) => b.score - a.score);
    return {
      areaId,
      category: getArea(areaId)!.category,
      rawScore: rawScores[i],
      share: profile[i],
      contributions,
    };
  });

  const categories: CategoryResult[] = CATEGORY_IDS.map((category: CategoryId) => {
    const catAreas = areas.filter((a) => a.category === category);
    // Contribuciones por materia agregadas dentro de la categoría.
    const bySubject = new Map<string, SubjectContribution>();
    for (const area of catAreas) {
      for (const c of area.contributions) {
        const prev = bySubject.get(c.subjectId);
        if (prev) {
          prev.score += c.score;
          prev.share += c.share;
          if (c.justification && !prev.justification.includes(c.justification)) {
            prev.justification = `${prev.justification} ${c.justification}`.trim();
          }
        } else bySubject.set(c.subjectId, { ...c });
      }
    }
    return {
      category,
      rawScore: catAreas.reduce((s, a) => s + a.rawScore, 0),
      share: catAreas.reduce((s, a) => s + a.share, 0),
      areas: catAreas,
      contributions: [...bySubject.values()].sort((a, b) => b.score - a.score),
    };
  });

  return { rawScores, profile, areas, categories, classifiedWeight };
}

export function categorySharesRecord(categories: readonly CategoryResult[]): Record<CategoryId, number> {
  return Object.fromEntries(categories.map((c) => [c.category, c.share])) as Record<CategoryId, number>;
}

