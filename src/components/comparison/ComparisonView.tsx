"use client";

import { useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, Info, PlusCircle, Sparkles, Trash2 } from "lucide-react";
import { CC2020_CATEGORIES } from "@/data/cc2020-areas";
import { DISCIPLINES } from "@/data/cc2020-reference";
import {
  compareCareers,
  COMPARISON_DIMENSIONS,
  dimensionValue,
} from "@/lib/analysis/compare";
import { computeAnalysis } from "@/lib/analysis/compute";
import { categorySharesRecord } from "@/lib/analysis/profile";
import { CurriculumMap2D } from "@/components/charts/CurriculumMap2D";
import type { StoredAnalysis } from "@/types";

const PALETTE = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626"];

import { ViewSelector } from "@/components/layout/ViewSelector";
import { SustainabilityComparison } from "@/components/sustainability/SustainabilityComparison";

const views = ["Categorías", "Ejes", "Disciplinas", "Mapa", "Sustentabilidad"] as const;

interface ComparisonViewProps {
  analyses: StoredAnalysis[];
  hasDemo: boolean;
  onAddAnotherCareer: () => void;
  onAddDemoCareer: () => void;
  onSelectCareerResult: (id: string) => void;
  onRemoveCareer: (id: string) => void;
  onBackToResults: () => void;
}

export function ComparisonView({
  analyses,
  hasDemo,
  onAddAnotherCareer,
  onAddDemoCareer,
  onSelectCareerResult,
  onRemoveCareer,
  onBackToResults,
}: ComparisonViewProps) {
  const [view, setView] = useState<(typeof views)[number]>(views[0]);
  const computed = useMemo(
    () =>
      analyses.map((a, idx) => ({
        stored: a,
        label: a.curriculum.careerName || `Carrera ${idx + 1}`,
        color: PALETTE[idx % PALETTE.length],
        result: computeAnalysis(a.curriculum, a.classifications),
      })),
    [analyses],
  );

  const statements = useMemo(
    () =>
      compareCareers(
        computed.map((c) => ({
          id: c.stored.id,
          label: c.label,
          result: c.result,
        })),
      ),
    [computed],
  );

  const categoryChartData = useMemo(() => {
    return CC2020_CATEGORIES.map((cat) => {
      const row: Record<string, string | number> = { category: cat.nameEs };
      for (const c of computed) {
        const share = c.result.categories.find((x) => x.category === cat.id)?.share ?? 0;
        row[c.stored.id] = Number((share * 100).toFixed(1));
      }
      return row;
    });
  }, [computed]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToResults}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al análisis individual
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {!hasDemo && (
            <button
              type="button"
              onClick={onAddDemoCareer}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-tint px-3.5 py-2 text-xs font-semibold text-accent hover:bg-tint"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              Agregar carrera de demostración
            </button>
          )}
          <button
            type="button"
            onClick={onAddAnotherCareer}
            className="inline-flex items-center gap-1.5 rounded-xl bg-action px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-action"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Analizar otra retícula
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8">
        <h1 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">
          Comparación entre carreras
        </h1>
        <p className="mt-1 text-sm text-muted">
          Explora la distribución del contenido de computación en cada plan.
        </p>

        {/* Tarjetas de las carreras incluidas */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {computed.map((c) => (
            <div
              key={c.stored.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-line bg-canvas/70 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-bold text-ink">{c.label}</h2>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {c.stored.curriculum.university || "Universidad no especificada"} ·{" "}
                  {c.stored.curriculum.subjects.length} materias
                </p>
                <button
                  type="button"
                  onClick={() => onSelectCareerResult(c.stored.id)}
                  className="mt-2 text-xs font-semibold text-accent hover:underline"
                >
                  Ver análisis individual →
                </button>
              </div>
              {computed.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveCareer(c.stored.id)}
                  aria-label={`Quitar ${c.label} de la comparación`}
                  className="rounded-lg p-1.5 text-muted hover:bg-tint hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>

        {computed.length < 2 ? (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-line bg-tint/50 p-8 text-center">
            <h2 className="text-lg font-bold text-ink">
              Agrega una segunda carrera para compararlas lado a lado
            </h2>
            <p className="mt-1 text-sm text-muted max-w-xl mx-auto">
              Actualmente tienes 1 carrera analizada en esta sesión. Sube otro plan de estudios o agrega la carrera de demostración para ver las gráficas comparativas.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={onAddAnotherCareer}
                className="inline-flex items-center gap-2 rounded-xl bg-action px-5 py-2.5 text-sm font-semibold text-white hover:bg-action"
              >
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Subir otra retícula
              </button>
              {!hasDemo && (
                <button
                  type="button"
                  onClick={onAddDemoCareer}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-accent hover:bg-tint"
                >
                  <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
                  Comparar contra la carrera DEMO
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Conclusiones comparativas deterministas */}
            <div className="mt-6 rounded-xl border border-line bg-tint/70 p-5">
              <h2 className="text-sm font-bold text-accent">
                Principales diferencias de enfoque detectadas
              </h2>
              <ul className="mt-2.5 space-y-1.5 list-disc pl-5 text-xs sm:text-sm text-ink leading-relaxed">
                {statements.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ul>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                <Info className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>
                  Estas comparaciones se calculan únicamente con las proporciones de cada plan y muestran diferencias de orientación académica, no de calidad.
                </span>
              </p>
            </div>

<ViewSelector label="Vistas del análisis" options={views} value={view} onChange={setView} />
      {view === "Sustentabilidad" && <SustainabilityComparison analyses={analyses} />}
            {view === "Categorías" && <>
            {/* Gráfica comparativa de las 6 categorías */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-ink">
                1. Distribución de conocimientos por categoría CC2020
              </h2>
              <div className="mt-4 h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#384250" />
                    <XAxis dataKey="category" stroke="#cad4e1" fontSize={11} />
                    <YAxis
                      unit="%"
                      stroke="#a2adbd"
                      fontSize={11}
                      domain={[0, "auto"]}
                    />
                    <Tooltip
                      formatter={(val) => [`${val}%`, "Proporción"]}
                      contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    {computed.map((c) => (
                      <Bar
                        key={c.stored.id}
                        dataKey={c.stored.id}
                        name={c.label}
                        fill={c.color}
                        radius={[6, 6, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            </>}
            {view === "Ejes" && <>
            {/* Tabla comparativa de los 5 ejes de orientación */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-ink">
                2. Comparación por ejes de orientación
              </h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-canvas text-muted">
                      <th className="p-3 font-bold">Dimensión académica</th>
                      {computed.map((c) => (
                        <th key={c.stored.id} className="p-3 font-bold">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: c.color }}
                              aria-hidden="true"
                            />
                            {c.label}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {COMPARISON_DIMENSIONS.map((dim) => (
                      <tr key={dim.id} className="hover:bg-canvas/70">
                        <td className="p-3 font-medium text-ink">{dim.label}</td>
                        {computed.map((c) => {
                          const pct = Math.round(dimensionValue(c.result, dim.categories) * 100);
                          return (
                            <td key={c.stored.id} className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="w-10 font-bold text-ink">{pct}%</span>
                                <div className="h-2 flex-1 max-w-32 overflow-hidden rounded-full bg-raised">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${pct}%`, backgroundColor: c.color }}
                                  />
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            </>}
            {view === "Disciplinas" && <>
            {/* Tabla comparativa de semejanza con las 6 disciplinas del CC2020 */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-ink">
                3. Semejanza con las disciplinas del CC2020 (índice 0–100 calculado)
              </h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-canvas text-muted">
                      <th className="p-3 font-bold">Disciplina de referencia CC2020</th>
                      {computed.map((c) => (
                        <th key={c.stored.id} className="p-3 font-bold">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {DISCIPLINES.map((d) => (
                      <tr key={d.id} className="hover:bg-canvas/70">
                        <td className="p-3 font-medium text-ink">
                          {d.nameEs}{" "}
                          <span className="text-xs text-muted">({d.id})</span>
                        </td>
                        {computed.map((c) => {
                          const sim = c.result.similarities.find((s) => s.discipline === d.id);
                          return (
                            <td key={c.stored.id} className="p-3 font-semibold text-ink">
                              {sim ? `${sim.index}/100` : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </>}
          </>
        )}
      </div>

      {/* Mapa bidimensional conjunto si hay 2 o más carreras */}
      {computed.length >= 2 && view === "Mapa" && (
        <CurriculumMap2D
          careerName={computed[0].label}
          careerPoint={computed[0].result.mapPoint}
          careerShares={categorySharesRecord(computed[0].result.categories)}
          extraCareers={computed.slice(1).map((c) => ({
            id: c.stored.id,
            label: c.label,
            point: c.result.mapPoint,
            shares: categorySharesRecord(c.result.categories),
            color: c.color,
          }))}
        />
      )}
    </div>
  );
}

