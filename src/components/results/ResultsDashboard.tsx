"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  Edit3,
  FileSpreadsheet,
  GitCompare,
  Info,
  Layers,
  PlusCircle,
  Printer,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { getArea, getCategory } from "@/data/cc2020-areas";
import { getDiscipline } from "@/data/cc2020-reference";
import { computeAnalysis } from "@/lib/analysis/compute";
import { CONFIDENCE_LABELS } from "@/lib/analysis/confidence";
import {
  buildDeterministicSummary,
  explainSimilarity,
  rankedCategories,
  topAreas,
  topSubjects,
} from "@/lib/analysis/explain";
import {
  downloadAnalysisCsv,
  downloadAnalysisJson,
  printAnalysisReport,
} from "@/lib/analysis/export";
import { categorySharesRecord } from "@/lib/analysis/profile";
import { WEIGHTING_LABELS } from "@/lib/analysis/weighting";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { CategoryRadarChart } from "@/components/charts/CategoryRadarChart";
import { CurriculumMap2D } from "@/components/charts/CurriculumMap2D";
import { TraceabilitySection } from "@/components/results/TraceabilitySection";
import type { StoredAnalysis } from "@/types";

import { ViewSelector } from "@/components/layout/ViewSelector";
import { SustainabilityPanel } from "@/components/sustainability/SustainabilityPanel";
import type { SustainabilityState } from "@/lib/sustainability/schema";

const views = ["Resumen", "Categorías", "Disciplinas", "Mapa", "Materias", "Sustentabilidad"] as const;

interface ResultsDashboardProps {
  onSaveSustainability: (state: SustainabilityState) => void;
  stored: StoredAnalysis;
  allAnalyses: StoredAnalysis[];
  onSelectAnalysis: (id: string) => void;
  onEditSubjects: () => void;
  onStartNewAnalysis: () => void;
  onOpenCompare: () => void;
  onResetAll: () => void;
}

export function ResultsDashboard({
  onSaveSustainability,
  stored,
  allAnalyses,
  onSelectAnalysis,
  onEditSubjects,
  onStartNewAnalysis,
  onOpenCompare,
  onResetAll,
}: ResultsDashboardProps) {
  const [view, setView] = useState<(typeof views)[number]>(views[0]);
  const result = useMemo(
    () => computeAnalysis(stored.curriculum, stored.classifications),
    [stored.curriculum, stored.classifications],
  );

  const summaryText = useMemo(
    () => stored.aiSummary || buildDeterministicSummary(stored.curriculum, result),
    [stored, result],
  );

  const ranked = useMemo(() => rankedCategories(result), [result]);
  const mainCategory = ranked[0] ? getCategory(ranked[0].category) : null;
  const topSimilarity = result.similarities[0];
  const topDiscipline = topSimilarity ? getDiscipline(topSimilarity.discipline) : null;
  const mainAreas = useMemo(() => topAreas(result, 5), [result]);
  const mainSubjects = useMemo(() => topSubjects(result, 5), [result]);
  const sharesRecord = useMemo(() => categorySharesRecord(result.categories), [result.categories]);

  const confidenceBadgeStyle =
    result.confidence.level === "suficiente"
      ? "bg-tint text-success border-line"
      : result.confidence.level === "parcial"
        ? "bg-tint text-warning border-line"
        : "bg-tint text-danger border-line";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Banner si se trata de la demostración interactiva */}
      {stored.isDemo && (
        <p className="text-sm text-muted">Demostración · Retícula de ejemplo</p>
      )}

      {/* Barra superior: selector de carreras en sesión, exportación y acciones */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          {allAnalyses.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pb-2 print:hidden">
              <span className="text-xs font-semibold text-muted">Carreras en tu sesión:</span>
              {allAnalyses.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectAnalysis(item.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    item.id === stored.id
                      ? "bg-action text-white"
                      : "bg-raised text-muted hover:bg-raised"
                  }`}
                >
                  {item.curriculum.careerName || "Carrera"}
                </button>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {stored.curriculum.careerName || "Carrera analizada"}
          </h1>
          <p className="text-sm text-muted">
            {stored.curriculum.university || "Universidad no especificada"}
            {stored.curriculum.planYear ? ` · Plan ${stored.curriculum.planYear}` : ""}
            {` · ${stored.curriculum.subjects.length} materias`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={onEditSubjects}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-muted hover:bg-canvas"
          >
            <Edit3 className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            Editar materias
          </button>

          <button
            type="button"
            onClick={onStartNewAnalysis}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-tint px-3 py-2 text-xs font-semibold text-accent hover:bg-tint"
          >
            <PlusCircle className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Analizar otra carrera
          </button>

          <button
            type="button"
            onClick={onOpenCompare}
            className="inline-flex items-center gap-1.5 rounded-xl bg-action px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-action"
          >
            <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
            Comparar carreras
          </button>

          <details className="result-tools"><summary>Más opciones</summary><div>

          <button
            type="button"
            onClick={() => downloadAnalysisJson(stored, result)}
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-2.5 py-2 text-xs font-medium text-muted hover:bg-canvas"
            title="Descargar resultados en formato JSON"
          >
            <Download className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
            JSON
          </button>

          <button
            type="button"
            onClick={() => downloadAnalysisCsv(stored, result)}
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-2.5 py-2 text-xs font-medium text-muted hover:bg-canvas"
            title="Descargar tabla en formato CSV para Excel"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            CSV
          </button>

          <button
            type="button"
            onClick={printAnalysisReport}
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-2.5 py-2 text-xs font-medium text-muted hover:bg-canvas"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Imprimir / PDF
          </button>

          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-2.5 py-2 text-xs font-medium text-muted hover:bg-tint hover:text-danger"
            title="Reiniciar y comenzar un análisis nuevo desde cero"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Borrar análisis de la sesión
          </button>
          </div></details>
        </div>
      </div>

      <ViewSelector label="Vistas del análisis" options={views} value={view} onChange={setView} />
      <div className={view === "Sustentabilidad" ? "space-y-5" : "hidden print:block"}>
        <SustainabilityPanel key={stored.id + stored.createdAt} stored={stored} onSave={onSaveSustainability} />
      </div>
      <div className={view === "Resumen" ? "space-y-5" : "hidden print:block"}>
      {/* SECCIÓN A: Resumen general ("Así es tu carrera") + Calidad del análisis */}
      <section
        aria-labelledby="heading-summary"
        className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Resumen general
            </span>
            <h2 id="heading-summary" className="mt-1 text-2xl font-bold text-ink">
              Así es tu carrera
            </h2>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${confidenceBadgeStyle}`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Respaldo documental: {CONFIDENCE_LABELS[result.confidence.level]}
          </span>
        </div>

        <p className="mt-4 text-base leading-relaxed text-ink bg-gradient-to-r from-tint to-surface border border-line rounded-xl p-4 sm:p-5">
          {summaryText}
        </p>

        {/* Tarjetas resumen de hallazgos principales */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-canvas/70 p-4">
            <span className="text-xs font-semibold text-muted">Mayor proporción del contenido de computación</span>
            {mainCategory && ranked[0] ? (
              <>
                <p className="mt-1 text-lg font-bold text-ink">
                  {mainCategory.nameEs} ({Math.round(ranked[0].share * 100)}%)
                </p>
                <p className="mt-1 text-xs text-muted">{mainCategory.examplesEs}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">Sin datos</p>
            )}
          </div>

          <div className="rounded-xl border border-line bg-canvas/70 p-4">
            <span className="text-xs font-semibold text-muted">
              Disciplina de referencia más cercana
            </span>
            {topDiscipline && topSimilarity ? (
              <>
                <p className="mt-1 text-lg font-bold text-ink">
                  {topDiscipline.nameEs} ({topDiscipline.id})
                </p>
                <p className="mt-1 text-xs text-muted">
                  Semejanza de perfiles (100 = máxima): <strong>{topSimilarity.index}/100</strong>
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">Sin datos</p>
            )}
          </div>

          <div className="rounded-xl border border-line bg-canvas/70 p-4">
            <span className="text-xs font-semibold text-muted">Cálculo y ponderación</span>
            <p className="mt-1 text-lg font-bold text-ink capitalize">
              {WEIGHTING_LABELS[result.weighting]}
            </p>
            <p className="mt-1 text-xs text-muted">
              {Math.round(result.classifiedFraction * 100)}% del plan corresponde a áreas de computación del CC2020.
            </p>
          </div>
        </div>

        <details className="disclosure"><summary>Ver áreas, materias y respaldo documental</summary>
        {/* Áreas específicas y materias con mayor peso */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
              <Layers className="h-4 w-4 text-accent" aria-hidden="true" />
              Las 5 áreas específicas del CC2020 con mayor presencia
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs">
              {mainAreas.map((a) => {
                const area = getArea(a.areaId)!;
                return (
                  <li key={a.areaId} className="flex items-center justify-between gap-2 text-muted">
                    <span>
                      <strong className="font-mono text-ink">{a.areaId}</strong>{" "}
                      {area.nameEs}
                    </span>
                    <span className="font-bold text-ink">
                      {(a.share * 100).toFixed(1)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-line p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
              <Award className="h-4 w-4 text-accent" aria-hidden="true" />
              Materias que más contribuyeron al perfil de computación
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs">
              {mainSubjects.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-muted">
                  <span className="truncate font-medium text-ink">{s.name}</span>
                  <span className="shrink-0 font-bold text-ink">
                    {(s.share * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Evaluación de respaldo documental (Sección 11 del prompt) */}
        <div className="mt-6 rounded-xl border border-line bg-canvas p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Calidad y respaldo documental de este análisis: {CONFIDENCE_LABELS[result.confidence.level]}
            </h3>
            <span className="text-xs text-muted">
              Criterios cumplidos: {result.confidence.points} de {result.confidence.maxPoints}
            </span>
          </div>

          {result.confidence.onlyNames && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-line bg-tint p-3 text-xs text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning mt-0.5" aria-hidden="true" />
              <p>
                Este análisis es aproximado porque no contamos con los temarios completos. Puedes obtener un resultado más detallado si agregas información sobre las asignaturas.
              </p>
            </div>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {result.confidence.factors.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between rounded-lg border border-line/80 bg-surface px-3 py-2 text-xs"
              >
                <span className="text-muted">{f.label}:</span>
                <span className={`font-semibold ${f.ok ? "text-success" : "text-warning"}`}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        </details>
      </section>

      </div>
      <div className={view === "Categorías" ? "space-y-5" : "hidden print:block"}>
      {/* SECCIÓN B: Gráfica principal de barras horizontales */}
      <CategoryBarChart categories={result.categories} />

      </div>
      <div className={view === "Disciplinas" ? "space-y-5" : "hidden print:block"}>
      {/* SECCIÓN C: Gráfica radar + Semejanza con perfiles oficiales del CC2020 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryRadarChart
          careerName={stored.curriculum.careerName}
          categories={result.categories}
          defaultReferenceDiscipline={topSimilarity?.discipline}
        />

        {/* Panel de semejanza con las 6 disciplinas oficiales */}
        <section
          aria-labelledby="heading-similarity"
          className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-xs"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Comparación con la Tabla 5.3 del CC2020
            </span>
            <h2 id="heading-similarity" className="mt-1 text-xl font-bold text-ink">
              Semejanza con las 6 disciplinas de referencia
            </h2>
            <p className="mt-1 text-xs text-muted">
              Comparamos el perfil de tu carrera contra el punto medio de los rangos de importancia de la Tabla 5.3 mediante similitud coseno.{" "}
              <strong>Es un índice de semejanza (0 a 100) calculado por la plataforma, no un porcentaje de pertenencia oficial.</strong>
            </p>

            <ul className="mt-4 space-y-3">
              {result.similarities.map((sim, idx) => {
                const d = getDiscipline(sim.discipline);
                return (
                  <li
                    key={sim.discipline}
                    className={`rounded-xl border p-3.5 transition-colors ${
                      idx === 0
                        ? "border-line bg-tint/40"
                        : "border-line bg-canvas/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-bold text-ink">
                          {d.nameEs}{" "}
                          <span className="text-xs font-normal text-muted">
                            ({d.nameEn} · {d.id})
                          </span>
                        </span>
                      </div>
                      <span className="shrink-0 rounded-lg bg-strong px-2.5 py-1 text-xs font-bold text-white">
                        Índice: {sim.index}/100
                      </span>
                    </div>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-raised">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${sim.index}%`, backgroundColor: d.color }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-muted leading-relaxed">
                      {explainSimilarity(result, sim.discipline)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-canvas p-3 text-xs text-muted">
            <Info className="h-4 w-4 shrink-0 text-muted mt-0.5" aria-hidden="true" />
            <span>
              En México y Latinoamérica muchas carreras combinan elementos de varias disciplinas del CC2020 (por ejemplo, Sistemas Computacionales suele mezclar Ciencias de la Computación, Ingeniería de Software y Tecnologías de la Información).
            </span>
          </div>
        </section>
      </div>

      </div>
      <div className={view === "Mapa" ? "space-y-5" : "hidden print:block"}>
      {/* SECCIÓN D: Mapa curricular bidimensional */}
      <CurriculumMap2D
        careerName={stored.curriculum.careerName}
        careerPoint={result.mapPoint}
        careerShares={sharesRecord}
      />

      </div>
      <div className={view === "Materias" ? "space-y-5" : "hidden print:block"}>
      {/* SECCIÓN E: Materias que explican el resultado */}
      <TraceabilitySection
        curriculum={stored.curriculum}
        classifications={stored.classifications}
        result={result}
        onEditSubjects={onEditSubjects}
      />

      {/* Limitaciones del análisis */}
      <section
        aria-labelledby="heading-limitations"
        className="rounded-2xl border border-line bg-raised/80 p-6 text-xs text-muted"
      >
        <h2
          id="heading-limitations"
          className="flex items-center gap-2 text-sm font-bold text-ink"
        >
          <ShieldAlert className="h-4 w-4 text-muted" aria-hidden="true" />
          Alcance y limitaciones de este análisis
        </h2>
        <ul className="mt-2.5 grid gap-2 sm:grid-cols-2 list-disc pl-5 leading-relaxed">
          <li>
            <strong>No evalúa la calidad de la universidad:</strong> este análisis solo describe qué proporción de temas se estudian en el plan, no qué tan buenos son los profesores, laboratorios o egresados.
          </li>
          <li>
            <strong>Los nombres de materias pueden variar:</strong> dos universidades pueden llamar igual a asignaturas con temarios distintos. Si agregas descripciones o temarios en el paso de revisión, la clasificación será más precisa.
          </li>
          <li>
            <strong>Distribución sobre el contenido de computación:</strong> los porcentajes de las 6 categorías representan la proporción dentro de las materias relacionadas con computación; las materias de matemáticas generales, física o humanidades se reportan por separado.
          </li>
          <li>
            <strong>Separación entre CC2020 y algoritmos propios:</strong> las 34 áreas y la Tabla 5.3 provienen íntegramente del reporte oficial CC2020; la ponderación, similitud coseno y proyección 2D son métodos matemáticos propios de esta plataforma.
          </li>
        </ul>
      </section>
      </div>
    </div>
  );
}

