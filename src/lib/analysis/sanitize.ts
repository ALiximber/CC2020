import { AREA_IDS } from "@/data/cc2020-areas";
import type { AreaAssignment } from "@/types";

/**
 * Limpia las relaciones materia→área:
 *  - descarta áreas inexistentes y relevancias no numéricas,
 *  - limita cada relevancia a [0, 1],
 *  - fusiona áreas repetidas (sumando),
 *  - si la suma supera 1, reescala proporcionalmente para que sume exactamente 1.
 * Es determinista y se aplica tanto en el servidor como en el cliente.
 */
export function sanitizeAssignments(assignments: readonly AreaAssignment[]): AreaAssignment[] {
  const valid = new Set(AREA_IDS);
  const merged = new Map<string, AreaAssignment>();
  for (const a of assignments) {
    if (!valid.has(a.areaId)) continue;
    const r = Number(a.relevance);
    if (!Number.isFinite(r) || r <= 0) continue;
    const clamped = Math.min(1, r);
    const prev = merged.get(a.areaId);
    if (prev) {
      prev.relevance += clamped;
      if (a.justification && !prev.justification.includes(a.justification)) {
        prev.justification = `${prev.justification} ${a.justification}`.trim();
      }
    } else {
      merged.set(a.areaId, { areaId: a.areaId, relevance: clamped, justification: (a.justification ?? "").trim() });
    }
  }
  const list = [...merged.values()];
  const total = list.reduce((s, a) => s + a.relevance, 0);
  if (total > 1) {
    for (const a of list) a.relevance = a.relevance / total;
  }
  return list.sort((a, b) => b.relevance - a.relevance);
}

