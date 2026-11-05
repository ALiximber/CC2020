import type { AnalysisResult, Curriculum, SubjectClassification } from "@/types";
import { evaluateConfidence } from "./confidence";
import { categorySharesRecord, computeProfile } from "./profile";
import { projectToMap } from "./projection";
import { sanitizeAssignments } from "./sanitize";
import { computeSimilarities } from "./similarity";
import { chooseWeighting } from "./weighting";

export class EmptyProfileError extends Error {
  constructor() {
    super("Ninguna materia pudo relacionarse con las áreas del CC2020.");
  }
}

/**
 * Ejecuta el análisis completo de forma determinista a partir de:
 *  - las materias del plan de estudios y
 *  - las relaciones materia→área propuestas por la IA.
 * Mismos datos de entrada ⇒ mismos resultados.
 */
export function computeAnalysis(curriculum: Curriculum, classifications: readonly SubjectClassification[]): AnalysisResult {
  const subjects = curriculum.subjects;
  const weighting = chooseWeighting(subjects);
  const prof = computeProfile(subjects, classifications, weighting);

  const clsById = new Map(classifications.map((c) => [c.subjectId, c]));
  const unclassifiedSubjects: AnalysisResult["unclassifiedSubjects"] = [];
  const uncertainSubjects: AnalysisResult["uncertainSubjects"] = [];
  for (const s of subjects) {
    const c = clsById.get(s.id);
    const assignments = c ? sanitizeAssignments(c.assignments) : [];
    if (assignments.length === 0) unclassifiedSubjects.push({ id: s.id, name: s.name });
    if (c?.uncertain) uncertainSubjects.push({ id: s.id, name: s.name, note: c.note });
  }

  const classifiedFraction = weighting.total > 0 ? prof.classifiedWeight / weighting.total : 0;
  const shares = categorySharesRecord(prof.categories);

  const confidence = evaluateConfidence({
    curriculum,
    weighting: weighting.method,
    uncertainCount: uncertainSubjects.length,
    unclassifiedCount: unclassifiedSubjects.length,
    classifiedFraction,
  });

  return {
    weighting: weighting.method,
    totalWeight: weighting.total,
    classifiedFraction,
    areas: prof.areas,
    categories: prof.categories,
    similarities: computeSimilarities(prof.profile),
    mapPoint: projectToMap(shares),
    unclassifiedSubjects,
    uncertainSubjects,
    confidence,
  };
}

export function hasClassifiedContent(result: AnalysisResult): boolean {
  return result.categories.some((c) => c.share > 0);
}

