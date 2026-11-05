import { getArea, getCategory, type CategoryId } from "@/data/cc2020-areas";
import { getDiscipline } from "@/data/cc2020-reference";
import type { AnalysisResult, Curriculum } from "@/types";
import { referenceCategoryShares } from "@/lib/cc2020/reference-profiles";

const pct = (v: number) => `${Math.round(v * 100)}%`;

export function rankedCategories(result: AnalysisResult) {
  return [...result.categories].sort((a, b) => b.share - a.share);
}

export function topAreas(result: AnalysisResult, n = 5) {
  return [...result.areas].filter((a) => a.share > 0).sort((a, b) => b.share - a.share).slice(0, n);
}

/** Materias que más aportan al perfil (sumando todas sus áreas). */
export function topSubjects(result: AnalysisResult, n = 5) {
  const bySubject = new Map<string, { name: string; share: number }>();
  for (const area of result.areas) {
    for (const c of area.contributions) {
      const prev = bySubject.get(c.subjectId);
      if (prev) prev.share += c.share;
      else bySubject.set(c.subjectId, { name: c.subjectName, share: c.share });
    }
  }
  return [...bySubject.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.share - a.share)
    .slice(0, n);
}

/**
 * Resumen determinista en lenguaje sencillo, generado solo con los números
 * calculados. Se usa siempre como base (y en la demostración) y cuando la IA no
 * está disponible para redactar el resumen.
 */
export function buildDeterministicSummary(curriculum: Curriculum, result: AnalysisResult): string {
  const ranked = rankedCategories(result).filter((c) => c.share > 0);
  if (ranked.length === 0) return "No fue posible relacionar las materias con áreas de computación.";
  const name = curriculum.careerName || "Esta carrera";
  const first = getCategory(ranked[0].category);
  const parts: string[] = [];
  parts.push(
    `${name} dedica la mayor parte de su contenido de computación a ${first.nameEs.toLowerCase()} (${pct(ranked[0].share)}).`,
  );
  if (ranked[1]) {
    const second = getCategory(ranked[1].category);
    const third = ranked[2] ? getCategory(ranked[2].category) : null;
    parts.push(
      third
        ? `También tiene un peso importante en ${second.nameEs.toLowerCase()} (${pct(ranked[1].share)}) y ${third.nameEs.toLowerCase()} (${pct(ranked[2].share)}).`
        : `También incluye ${second.nameEs.toLowerCase()} (${pct(ranked[1].share)}).`,
    );
  }
  const top = result.similarities[0];
  if (top) {
    parts.push(
      `Su perfil se parece más al de referencia de ${getDiscipline(top.discipline).nameEs} según el CC2020 (índice de semejanza ${top.index}/100).`,
    );
  }
  if (result.classifiedFraction < 0.999) {
    parts.push(
      `Cerca del ${pct(1 - result.classifiedFraction)} del plan corresponde a materias que no se relacionan directamente con áreas de computación (por ejemplo, matemáticas, ciencias o formación general).`,
    );
  }
  return parts.join(" ");
}

/** Explica por qué el perfil se parece a una disciplina comparando categorías. */
export function explainSimilarity(result: AnalysisResult, disciplineId: Parameters<typeof getDiscipline>[0]): string {
  const ref = referenceCategoryShares(disciplineId);
  const d = getDiscipline(disciplineId);
  const diffs = result.categories.map((c) => ({ cat: c.category, career: c.share, ref: ref[c.category] }));
  const shared = diffs
    .filter((x) => x.career >= 0.15 && x.ref >= 0.15)
    .sort((a, b) => b.career - a.career)
    .map((x) => getCategory(x.cat).nameEs.toLowerCase());
  const biggestGap = [...diffs].sort((a, b) => Math.abs(b.career - b.ref) - Math.abs(a.career - a.ref))[0];
  const parts: string[] = [];
  if (shared.length) parts.push(`Ambos perfiles dan peso a ${shared.join(", ")}.`);
  if (biggestGap && Math.abs(biggestGap.career - biggestGap.ref) >= 0.05) {
    const cat = getCategory(biggestGap.cat).nameEs.toLowerCase();
    parts.push(
      biggestGap.career > biggestGap.ref
        ? `La carrera analizada tiene más ${cat} (${pct(biggestGap.career)}) que el perfil de referencia de ${d.nameEs} (${pct(biggestGap.ref)}).`
        : `La carrera analizada tiene menos ${cat} (${pct(biggestGap.career)}) que el perfil de referencia de ${d.nameEs} (${pct(biggestGap.ref)}).`,
    );
  }
  return parts.join(" ") || `El perfil tiene una distribución similar a la de ${d.nameEs}.`;
}

export function areaLabel(areaId: string): string {
  return getArea(areaId)?.nameEs ?? areaId;
}

export function categoryLabel(id: CategoryId): string {
  return getCategory(id).nameEs;
}

