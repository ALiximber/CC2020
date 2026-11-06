import type { Subject } from "@/types";
import type { SubjectInsight } from "./schema";
import { LearningSchema, type Learning } from "./schema";

export function validateSubjects(insights: SubjectInsight[], subjects: Subject[]): SubjectInsight[] {
  const seen = new Set<string>();
  return insights.filter(i => subjects.some(s => s.id === i.subjectId) && !seen.has(i.subjectId) && !!seen.add(i.subjectId)).map(i => {
    const s = subjects.find(s => s.id === i.subjectId)!;
    const source = s.officialProgram?.text || s.description;
    const evidence = i.explicit.evidence.filter(e => e.trim().length >= 12 && source.includes(e));
    const topical = evidence.some(e => /sustentab|sostenib|medio\s*ambient|ambiental|responsabilidad social|cambio clim|ecolog|residuos|energ[ií]a renovable|inclusi[oó]n|equidad/i.test(e));
    const supported = i.explicit.status === "present" ? topical : i.explicit.status === "absent" && !!s.officialProgram?.complete && evidence.length > 0;
    return { ...i, confidence: source ? i.confidence : "low", explicit: supported ? { ...i.explicit, evidence } : { status: "unknown", evidence: [], explanation: "No se puede determinar la integración explícita con la evidencia disponible." } };
  });
}
export function informationLevel(s: Subject) { return s.officialProgram?.text ? 3 : s.description.trim() ? 2 : 1; }

export function validateLearning(value: unknown, subjects: Subject[]): Learning {
  const data = LearningSchema.parse(value);
  const validIds = new Set(subjects.map(s => s.id));
  for (const item of [...data.projects, ...data.activities, ...data.sectors]) {
    if (item.subjectIds.some(id => !validIds.has(id))) throw new Error("La respuesta contiene materias ajenas al plan. Intenta nuevamente.");
  }
  if (data.activities.some(a => a.answer >= a.options.length)) throw new Error("La actividad contiene una respuesta inválida. Intenta nuevamente.");
  return data;
}
