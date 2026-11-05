"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronRight, Info, Layers } from "lucide-react";
import { getArea, getCategory, type CategoryId } from "@/data/cc2020-areas";
import { toPercentages } from "@/lib/analysis/vector";
import type { CategoryResult } from "@/types";

interface CategoryBarChartProps {
  categories: CategoryResult[];
}

export function CategoryBarChart({ categories }: CategoryBarChartProps) {
  // Ordenamos de mayor a menor énfasis para facilitar la lectura.
  const sorted = [...categories].sort((a, b) => b.share - a.share);
  const roundedPercents = toPercentages(sorted.map((c) => c.share));

  const [selectedCatId, setSelectedCatId] = useState<CategoryId>(sorted[0]?.category ?? "SD");

  const chartData = sorted.map((c, idx) => {
    const meta = getCategory(c.category);
    return {
      id: c.category,
      nameEs: meta.nameEs,
      nameEn: meta.nameEn,
      percent: roundedPercents[idx],
      exactPercent: Number((c.share * 100).toFixed(1)),
      color: meta.color,
    };
  });

  const selectedCategory = sorted.find((c) => c.category === selectedCatId) ?? sorted[0];
  const selectedMeta = selectedCategory ? getCategory(selectedCategory.category) : null;
  const selectedIdx = sorted.findIndex((c) => c.category === selectedCatId);
  const selectedPercent = selectedIdx >= 0 ? roundedPercents[selectedIdx] : 0;

  return (
    <section
      aria-labelledby="heading-bar-chart"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Distribución por categorías del CC2020
          </span>
          <h2 id="heading-bar-chart" className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            ¿En qué se enfoca esta carrera?
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Haz clic en cualquier categoría para explorar sus áreas y materias.
        </p>
      </div>

      {/* Gráfica de barras horizontales con Recharts */}
      <div className="mt-6 h-72 w-full" aria-label="Gráfica de barras horizontales de las 6 categorías del CC2020">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 28, left: 8, bottom: 4 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="nameEs"
              width={175}
              stroke="#334155"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [`${value}% del contenido de computación`, "Proporción"]}
              contentStyle={{
                borderRadius: "12px",
                borderColor: "#e2e8f0",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="percent"
              radius={[0, 8, 8, 0]}
              className="cursor-pointer"
              onClick={(entry) => {
                if (entry?.id) setSelectedCatId(entry.id as CategoryId);
              }}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={entry.color}
                  fillOpacity={entry.id === selectedCatId ? 1 : 0.78}
                  stroke={entry.id === selectedCatId ? "#0f172a" : "none"}
                  strokeWidth={entry.id === selectedCatId ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tarjetas interactivas de las 6 categorías (explicación sencilla + materias relacionadas) */}
      <div className="mt-6 grid gap-3.5 md:grid-cols-2">
        {sorted.map((catResult, idx) => {
          const meta = getCategory(catResult.category);
          const pct = roundedPercents[idx];
          const isSelected = catResult.category === selectedCatId;
          const topSubjects = catResult.contributions.slice(0, 3);

          return (
            <button
              key={catResult.category}
              type="button"
              onClick={() => setSelectedCatId(catResult.category)}
              aria-pressed={isSelected}
              className={`group flex flex-col justify-between rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isSelected
                  ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {meta.number}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {meta.nameEs} — {pct}%
                      </h3>
                      <span className="block text-[11px] font-medium text-slate-500">
                        CC2020: {meta.nameEn}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isSelected ? "rotate-90 text-blue-600" : "text-slate-400 group-hover:translate-x-0.5"
                    }`}
                    aria-hidden="true"
                  />
                </div>

                {/* Barra visual accesible */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%`, backgroundColor: meta.color }}
                  />
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                  {meta.descriptionEs}
                </p>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2.5">
                {topSubjects.length > 0 ? (
                  <p className="text-xs text-slate-700">
                    <strong className="font-semibold text-slate-800">Materias relacionadas: </strong>
                    {topSubjects.map((s) => s.subjectName).join(", ")}
                    {catResult.contributions.length > 3
                      ? ` (+${catResult.contributions.length - 3} más)`
                      : ""}
                  </p>
                ) : (
                  <p className="text-xs italic text-slate-400">
                    Sin materias asociadas directamente a esta categoría.
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Panel de detalle de la categoría seleccionada */}
      {selectedCategory && selectedMeta && (
        <div className="mt-6 rounded-2xl border border-blue-200 bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: selectedMeta.color }}
              >
                {selectedMeta.number}
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Detalle de «{selectedMeta.nameEs}» ({selectedPercent}%)
                </h3>
                <p className="text-xs text-slate-500">
                  Categoría oficial CC2020: {selectedMeta.nameEn}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">
              <Layers className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
              {selectedCategory.areas.length} áreas específicas del CC2020
            </span>
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Áreas específicas del CC2020 dentro de esta categoría
              </h4>
              <ul className="mt-2.5 space-y-2">
                {selectedCategory.areas.map((a) => {
                  const areaInfo = getArea(a.areaId)!;
                  const areaPct = Number((a.share * 100).toFixed(1));
                  return (
                    <li
                      key={a.areaId}
                      className="rounded-xl border border-slate-200/80 bg-white p-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">
                          <span className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
                            {a.areaId}
                          </span>
                          {areaInfo.nameEs}
                        </span>
                        <span className="font-bold text-slate-900">{areaPct}%</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {areaInfo.nameEn} — {areaInfo.descriptionEs}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Materias de tu plan que aportan a esta categoría ({selectedCategory.contributions.length})
              </h4>
              {selectedCategory.contributions.length > 0 ? (
                <ul className="mt-2.5 space-y-2 max-h-80 overflow-y-auto pr-1">
                  {selectedCategory.contributions.map((c) => (
                    <li
                      key={c.subjectId}
                      className="rounded-xl border border-slate-200/80 bg-white p-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">{c.subjectName}</span>
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                          Aporta {(c.share * 100).toFixed(1)}% del total
                        </span>
                      </div>
                      {c.justification && (
                        <p className="mt-1 text-slate-600">{c.justification}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                  <Info className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <span>Ninguna materia del plan fue clasificada en esta categoría.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

