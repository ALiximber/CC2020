import type { Subject } from "@/types";

export function newId(prefix = "s"): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rnd}`;
}

/**
 * Convierte texto escrito por el usuario en materias.
 * Formato flexible, una materia por línea:
 *   Semestre 1                      ← encabezado opcional (también "1er semestre", "Cuatrimestre 2")
 *   Nombre de la materia | 5 | temario opcional
 * El segundo campo (créditos) y el tercero (descripción) son opcionales.
 */
export function parseManualSubjects(text: string): Subject[] {
  const subjects: Subject[] = [];
  let semester: number | null = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const trimmedLine = rawLine.trim();
    if (!trimmedLine) continue;
    const header =
      trimmedLine.match(/^(?:semestre|cuatrimestre|periodo|período|trimestre|nivel)\s*(\d{1,2})\s*:?$/i) ??
      trimmedLine.match(/^(\d{1,2})\s*(?:º|°|er|do|ro|to|vo|no|mo)?\.?\s*(?:semestre|cuatrimestre|periodo|período|trimestre)\s*:?$/i);
    if (header) {
      semester = parseInt(header[1], 10);
      continue;
    }
    const line = trimmedLine.replace(/^[\s\-•*·\d.)]+(?=[A-Za-zÁÉÍÓÚÑáéíóúñ])/, "").trim();
    if (!line) continue;
    const [namePart, creditsPart, ...descParts] = line.split("|").map((p) => p.trim());
    if (!namePart || namePart.length < 2) continue;
    const creditsNum = creditsPart ? Number(creditsPart.replace(",", ".")) : NaN;
    subjects.push({
      id: newId(),
      name: namePart.slice(0, 200),
      semester,
      credits: Number.isFinite(creditsNum) && creditsNum > 0 ? creditsNum : null,
      hours: null,
      description: descParts.join(" | ").slice(0, 2500),
    });
  }
  return subjects;
}

