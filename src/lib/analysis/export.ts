"use client";

import { getArea, getCategory } from "@/data/cc2020-areas";
import { CC2020_CITATION, CC2020_URL, getDiscipline } from "@/data/cc2020-reference";
import { CONFIDENCE_LABELS } from "@/lib/analysis/confidence";
import { WEIGHTING_LABELS } from "@/lib/analysis/weighting";
import type { AnalysisResult, StoredAnalysis } from "@/types";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "analisis-cc2020"
  );
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

/**
 * Descarga un archivo JSON con todos los datos de entrada, clasificaciones y
 * resultados calculados para que el análisis sea verificable y reproducible.
 */
export function downloadAnalysisJson(stored: StoredAnalysis, result: AnalysisResult): void {
  const payload = {
    meta: {
      exportedAt: new Date().toISOString(),
      isDemo: stored.isDemo,
      referenceFramework: CC2020_CITATION,
      referenceUrl: CC2020_URL,
      note: "Los porcentajes por categoría, índices de semejanza y coordenadas del mapa 2D son cálculos propios de la plataforma basados en las tablas 4.1 y 5.3 del CC2020.",
    },
    curriculum: stored.curriculum,
    sustainability: stored.sustainability,
    classifications: stored.classifications,
    results: {
      weightingMethod: result.weighting,
      weightingLabel: WEIGHTING_LABELS[result.weighting],
      totalWeight: result.totalWeight,
      classifiedFraction: Number(result.classifiedFraction.toFixed(4)),
      confidence: {
        level: result.confidence.level,
        label: CONFIDENCE_LABELS[result.confidence.level],
        points: result.confidence.points,
        maxPoints: result.confidence.maxPoints,
        factors: result.confidence.factors,
      },
      categories: result.categories.map((c) => {
        const cat = getCategory(c.category);
        return {
          id: c.category,
          nameEs: cat.nameEs,
          nameEn: cat.nameEn,
          percentage: Number((c.share * 100).toFixed(2)),
          rawScore: Number(c.rawScore.toFixed(3)),
        };
      }),
      areas: result.areas.map((a) => {
        const area = getArea(a.areaId)!;
        return {
          id: a.areaId,
          category: a.category,
          nameEs: area.nameEs,
          nameEn: area.nameEn,
          percentage: Number((a.share * 100).toFixed(2)),
          rawScore: Number(a.rawScore.toFixed(3)),
        };
      }),
      similarities: result.similarities.map((s) => {
        const d = getDiscipline(s.discipline);
        return {
          discipline: s.discipline,
          nameEs: d.nameEs,
          nameEn: d.nameEn,
          similarityIndex: s.index,
          cosine: Number(s.cosine.toFixed(4)),
        };
      }),
      mapCoordinates2D: {
        x: Number(result.mapPoint.x.toFixed(4)),
        y: Number(result.mapPoint.y.toFixed(4)),
        disclaimer: "Este mapa es una representación estimada basada en el CC2020 y no una clasificación espacial oficial.",
      },
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  triggerDownload(blob, `${slugify(stored.curriculum.careerName)}-cc2020.json`);
}

function csvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Descarga una tabla CSV compatible con Excel (incluye BOM UTF-8) con el
 * resumen por categorías, semejanzas, áreas y el desglose materia por materia.
 */
export function downloadAnalysisCsv(stored: StoredAnalysis, result: AnalysisResult): void {
  const lines: string[] = [];
  const pushRow = (cells: (string | number | null | undefined)[]) => lines.push(cells.map(csvCell).join(","));

  pushRow(["ANÁLISIS CURRICULAR BASADO EN CC2020"]);
  pushRow(["Carrera", stored.curriculum.careerName || "Sin nombre"]);
  pushRow(["Universidad", stored.curriculum.university || "No especificada"]);
  pushRow(["Año / Plan", stored.curriculum.planYear || "No especificado"]);
  pushRow(["Demostración", stored.isDemo ? "Sí (datos ficticios de ejemplo)" : "No"]);
  pushRow(["Ponderación utilizada", WEIGHTING_LABELS[result.weighting]]);
  pushRow(["Respaldo documental", CONFIDENCE_LABELS[result.confidence.level]]);
  lines.push("");

  pushRow(["1. DISTRIBUCIÓN POR CATEGORÍAS DEL CC2020"]);
  pushRow(["ID Categoría", "Categoría (Español)", "Categoría (Inglés oficial)", "Porcentaje (%)", "Puntaje ponderado"]);
  for (const c of result.categories) {
    const cat = getCategory(c.category);
    pushRow([c.category, cat.nameEs, cat.nameEn, (c.share * 100).toFixed(2), c.rawScore.toFixed(2)]);
  }
  lines.push("");

  pushRow(["2. ÍNDICE DE SEMEJANZA CON DISCIPLINAS DE REFERENCIA (CALCULADO POR LA APLICACIÓN)"]);
  pushRow(["Sigla", "Disciplina (Español)", "Disciplina (Inglés oficial)", "Índice de semejanza (0-100)", "Similitud coseno"]);
  for (const s of result.similarities) {
    const d = getDiscipline(s.discipline);
    pushRow([s.discipline, d.nameEs, d.nameEn, s.index, s.cosine.toFixed(4)]);
  }
  lines.push("");

  pushRow(["3. DETALLE DE LAS 34 ÁREAS DE CONOCIMIENTO (TABLA 4.1 / 5.3 CC2020)"]);
  pushRow(["ID Área", "Categoría", "Área (Español)", "Área (Inglés oficial)", "Porcentaje (%)", "Puntaje ponderado"]);
  for (const a of result.areas) {
    const area = getArea(a.areaId)!;
    const cat = getCategory(a.category);
    pushRow([a.areaId, cat.nameEs, area.nameEs, area.nameEn, (a.share * 100).toFixed(2), a.rawScore.toFixed(2)]);
  }
  lines.push("");

  pushRow(["4. MATERIAS ANALIZADAS Y SU CLASIFICACIÓN"]);
  pushRow(["Semestre", "Materia", "Créditos", "Horas", "Áreas CC2020 asignadas", "Incertidumbre", "Justificación"]);
  const clsMap = new Map(stored.classifications.map((c) => [c.subjectId, c]));
  for (const s of stored.curriculum.subjects) {
    const cls = clsMap.get(s.id);
    const areasText =
      cls && cls.assignments.length > 0
        ? cls.assignments
            .map((a) => {
              const area = getArea(a.areaId);
              return `${a.areaId} ${area?.nameEs ?? ""} (${Math.round(a.relevance * 100)}%)`;
            })
            .join(" | ")
        : "Sin área de computación asignada";
    const justText =
      cls && cls.assignments.length > 0
        ? cls.assignments.map((a) => a.justification).filter(Boolean).join(" / ")
        : cls?.note || "";
    pushRow([s.semester ?? "", s.name, s.credits ?? "", s.hours ?? "", areasText, cls?.uncertain ? "Sí" : "No", justText]);
  }

  // BOM UTF-8 para que Excel en español reconozca acentos correctamente.
  const bom = "\uFEFF";
  const blob = new Blob([bom + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `${slugify(stored.curriculum.careerName)}-cc2020.csv`);
}

/** Abre el diálogo de impresión del navegador para guardar el reporte como PDF. */
export function printAnalysisReport(): void {
  if (typeof window !== "undefined") {
    window.print();
  }
}

