import type { ConfidenceFactor, ConfidenceLevel, ConfidenceResult, Curriculum, WeightingMethod } from "@/types";

export interface ConfidenceInput {
  curriculum: Curriculum;
  weighting: WeightingMethod;
  uncertainCount: number;
  unclassifiedCount: number;
  classifiedFraction: number;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/**
 * Evalúa el RESPALDO DOCUMENTAL del análisis con reglas fijas y transparentes.
 * No es una probabilidad de exactitud: solo resume qué tan completa es la
 * información disponible.
 *
 * Puntos (máx. 9):
 *  - Materias identificadas: ≥25 → 2, ≥12 → 1.
 *  - Créditos u horas disponibles para todas las materias → 1.
 *  - Materias con descripción/temario: ≥60% → 2, ≥20% → 1.
 *  - Materias ambiguas (marcadas por la IA): ≤15% → 1.
 *  - Contenido relacionado con computación: ≥40% del peso → 1.
 *  - Materias sin ninguna área (p. ej. ciencias básicas): ≤50% → 1.
 *  - Calidad del documento: texto digital o captura manual → 1.
 * Niveles: ≥7 suficiente, ≥4 parcial, resto limitada.
 */
export function evaluateConfidence(input: ConfidenceInput): ConfidenceResult {
  const { curriculum, weighting, uncertainCount, unclassifiedCount, classifiedFraction } = input;
  const n = curriculum.subjects.length;
  const withDesc = curriculum.subjects.filter((s) => s.description.trim().length >= 25).length;
  const descRatio = n > 0 ? withDesc / n : 0;
  const uncertainRatio = n > 0 ? uncertainCount / n : 1;
  const unclassifiedRatio = n > 0 ? unclassifiedCount / n : 1;

  const factors: ConfidenceFactor[] = [];
  let points = 0;

  const nPts = n >= 25 ? 2 : n >= 12 ? 1 : 0;
  points += nPts;
  factors.push({ label: "Materias identificadas", value: String(n), ok: nPts > 0 });

  const wPts = weighting === "uniform" ? 0 : 1;
  points += wPts;
  factors.push({
    label: "Créditos u horas",
    value: weighting === "credits" ? "Créditos completos" : weighting === "hours" ? "Horas completas" : "No disponibles",
    ok: wPts > 0,
  });

  const dPts = descRatio >= 0.6 ? 2 : descRatio >= 0.2 ? 1 : 0;
  points += dPts;
  factors.push({ label: "Materias con temario o descripción", value: pct(descRatio), ok: dPts > 0 });

  const uPts = uncertainRatio <= 0.15 ? 1 : 0;
  points += uPts;
  factors.push({ label: "Materias ambiguas", value: `${uncertainCount} (${pct(uncertainRatio)})`, ok: uPts > 0 });

  const cPts = classifiedFraction >= 0.4 ? 1 : 0;
  points += cPts;
  factors.push({ label: "Contenido relacionado con computación", value: pct(classifiedFraction), ok: cPts > 0 });

  const ncPts = unclassifiedRatio <= 0.5 ? 1 : 0;
  points += ncPts;
  factors.push({ label: "Materias sin área de computación", value: `${unclassifiedCount} (${pct(unclassifiedRatio)})`, ok: ncPts > 0 });

  const qOk =
    curriculum.source === "pdf-text" || curriculum.source === "manual" || curriculum.source === "demo"
      ? curriculum.documentQuality !== "poor"
      : curriculum.documentQuality === "good";
  const qPts = qOk ? 1 : 0;
  points += qPts;
  const sourceLabel: Record<Curriculum["source"], string> = {
    "pdf-text": "PDF con texto",
    "pdf-scan": "PDF escaneado",
    image: "Imagen",
    manual: "Captura manual",
    demo: "Datos de demostración",
  };
  factors.push({ label: "Calidad del documento", value: sourceLabel[curriculum.source], ok: qPts > 0 });

  const maxPoints = 9;
  const level: ConfidenceLevel = points >= 7 ? "suficiente" : points >= 4 ? "parcial" : "limitada";
  return { level, points, maxPoints, factors, onlyNames: descRatio < 0.2 };
}

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  suficiente: "Información suficiente",
  parcial: "Información parcial",
  limitada: "Información limitada",
};

