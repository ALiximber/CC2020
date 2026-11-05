"use client";

import { useMemo } from "react";
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

interface ResultsDashboardProps {
  stored: StoredAnalysis;
  allAnalyses: StoredAnalysis[];
  onSelectAnalysis: (id: string) => void;
  onEditSubjects: () => void;
  onStartNewAnalysis: () => void;
  onOpenCompare: () => void;
  onResetAll: () => void;
}

export function ResultsDashboard({
  stored,
  allAnalyses,
  onSelectAnalysis,
  onEditSubjects,
  onStartNewAnalysis,
  onOpenCompare,
  onResetAll,
}: ResultsDashboardProps) {
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
      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
      : result.confidence.level === "parcial"
        ? "bg-amber-100 text-amber-900 border-amber-300"
        : "bg-red-100 text-red-900 border-red-300";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Banner si se trata de la demostración interactiva */}
      {stored.isDemo && (
        <div
          role="region"
          aria-label="Aviso de modo demostración"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-indigo-300 bg-indigo-50/90 p-5 text-indigo-950 shadow-xs print:border-slate-300"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 shrink-0 text-indigo-600 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-indigo-800">
                Modo de demostración (datos ficticios de ejemplo)
              </p>
              <p className="mt-0.5 text-sm text-indigo-900">
                Estás explorando una retícula de ejemplo creada para mostrar cómo funcionan las gráficas y los cálculos sin usar la API. Puedes analizar una carrera real cuando quieras.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartNewAnalysis}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 print:hidden"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Subir una retícula real
          </button>
        </div>
      )}

      {/* Barra superior: selector de carreras en sesión, exportación y acciones */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          {allAnalyses.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pb-2 print:hidden">
              <span className="text-xs font-semibold text-slate-500">Carreras en tu sesión:</span>
              {allAnalyses.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectAnalysis(item.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    item.id === stored.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {item.curriculum.careerName || "Carrera"}
                </button>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {stored.curriculum.careerName || "Carrera analizada"}
          </h1>
          <p className="text-sm text-slate-600">
            {stored.curriculum.university || "Universidad no especificada"}
            {stored.curriculum.planYear ? ` · Plan ${stored.curriculum.planYear}` : ""}
            {` · ${stored.curriculum.subjects.length} materias`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={onEditSubjects}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Edit3 className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
            Editar materias
          </button>

          <button
            type="button"
            onClick={onStartNewAnalysis}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100"
          >
            <PlusCircle className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
            Analizar otra carrera
          </button>

          <button
            type="button"
            onClick={onOpenCompare}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700"
          >
            <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
            Comparar carreras
          </button>

          <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" aria-hidden="true" />

          <button
            type="button"
            onClick={() => downloadAnalysisJson(stored, result)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="Descargar resultados en formato JSON"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            JSON
          </button>

          <button
            type="button"
            onClick={() => downloadAnalysisCsv(stored, result)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="Descargar tabla en formato CSV para Excel"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            CSV
          </button>

          <button
            type="button"
            onClick={printAnalysisReport}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
            Imprimir / PDF
          </button>

          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-700"
            title="Reiniciar y comenzar un análisis nuevo desde cero"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Nuevo
          </button>
        </div>
      </div>

      {/* SECCIÓN A: Resumen general ("Así es tu carrera") + Calidad del análisis */}
      <section
        aria-labelledby="heading-summary"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Resumen general
            </span>
            <h2 id="heading-summary" className="mt-1 text-2xl font-bold text-slate-900">
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

        <p className="mt-4 text-base leading-relaxed text-slate-800 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100 rounded-xl p-4 sm:p-5">
          {summaryText}
        </p>

        {/* Tarjetas resumen de hallazgos principales */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="text-xs font-semibold text-slate-500">Categoría predominante</span>
            {mainCategory && ranked[0] ? (
              <>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {mainCategory.nameEs} ({Math.round(ranked[0].share * 100)}%)
                </p>
                <p className="mt-1 text-xs text-slate-600">{mainCategory.examplesEs}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-slate-500">Sin datos</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="text-xs font-semibold text-slate-500">
              Disciplina de referencia más cercana
            </span>
            {topDiscipline && topSimilarity ? (
              <>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {topDiscipline.nameEs} ({topDiscipline.id})
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Índice de semejanza calculado: <strong>{topSimilarity.index}/100</strong>
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-slate-500">Sin datos</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="text-xs font-semibold text-slate-500">Cálculo y ponderación</span>
            <p className="mt-1 text-lg font-bold text-slate-900 capitalize">
              {WEIGHTING_LABELS[result.weighting]}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {Math.round(result.classifiedFraction * 100)}% del plan corresponde a áreas de computación del CC2020.
            </p>
          </div>
        </div>

        {/* Áreas específicas y materias con mayor peso */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Layers className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Las 5 áreas específicas del CC2020 con mayor presencia
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs">
              {mainAreas.map((a) => {
                const area = getArea(a.areaId)!;
                return (
                  <li key={a.areaId} className="flex items-center justify-between gap-2 text-slate-700">
                    <span>
                      <strong className="font-mono text-slate-900">{a.areaId}</strong>{" "}
                      {area.nameEs}
                    </span>
                    <span className="font-bold text-slate-900">
                      {(a.share * 100).toFixed(1)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Award className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Materias que más contribuyeron al perfil de computación
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-xs">
              {mainSubjects.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-slate-700">
                  <span className="truncate font-medium text-slate-900">{s.name}</span>
                  <span className="shrink-0 font-bold text-slate-900">
                    {(s.share * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Evaluación de respaldo documental (Sección 11 del prompt) */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Calidad y respaldo documental de este análisis: {CONFIDENCE_LABELS[result.confidence.level]}
            </h3>
            <span className="text-xs text-slate-500">
              Criterios cumplidos: {result.confidence.points} de {result.confidence.maxPoints}
            </span>
          </div>

          {result.confidence.onlyNames && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
              <p>
                Este análisis es aproximado porque no contamos con los temarios completos. Puedes obtener un resultado más detallado si agregas información sobre las asignaturas.
              </p>
            </div>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {result.confidence.factors.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs"
              >
                <span className="text-slate-600">{f.label}:</span>
                <span className={`font-semibold ${f.ok ? "text-emerald-700" : "text-amber-700"}`}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN B: Gráfica principal de barras horizontales */}
      <CategoryBarChart categories={result.categories} />

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
          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Comparación con la Tabla 5.3 del CC2020
            </span>
            <h2 id="heading-similarity" className="mt-1 text-xl font-bold text-slate-900">
              Semejanza con las 6 disciplinas de referencia
            </h2>
            <p className="mt-1 text-xs text-slate-600">
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
                        ? "border-blue-300 bg-blue-50/40"
                        : "border-slate-200 bg-slate-50/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-bold text-slate-900">
                          {d.nameEs}{" "}
                          <span className="text-xs font-normal text-slate-500">
                            ({d.nameEn} · {d.id})
                          </span>
                        </span>
                      </div>
                      <span className="shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                        Índice: {sim.index}/100
                      </span>
                    </div>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${sim.index}%`, backgroundColor: d.color }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      {explainSimilarity(result, sim.discipline)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <Info className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" aria-hidden="true" />
            <span>
              En México y Latinoamérica muchas carreras combinan elementos de varias disciplinas del CC2020 (por ejemplo, Sistemas Computacionales suele mezclar Ciencias de la Computación, Ingeniería de Software y Tecnologías de la Información).
            </span>
          </div>
        </section>
      </div>

      {/* SECCIÓN D: Mapa curricular bidimensional */}
      <CurriculumMap2D
        careerName={stored.curriculum.careerName}
        careerPoint={result.mapPoint}
        careerShares={sharesRecord}
      />

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
        className="rounded-2xl border border-slate-200 bg-slate-100/80 p-6 text-xs text-slate-700"
      >
        <h2
          id="heading-limitations"
          className="flex items-center gap-2 text-sm font-bold text-slate-900"
        >
          <ShieldAlert className="h-4 w-4 text-slate-700" aria-hidden="true" />
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
  );
}

