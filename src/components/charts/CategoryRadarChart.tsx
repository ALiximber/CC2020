"use client";

import { useState } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { HelpCircle } from "lucide-react";
import { CC2020_CATEGORIES } from "@/data/cc2020-areas";
import { DISCIPLINES, getDiscipline, type DisciplineId } from "@/data/cc2020-reference";
import { referenceCategoryShares } from "@/lib/cc2020/reference-profiles";
import type { CategoryResult } from "@/types";

interface CategoryRadarChartProps {
  careerName: string;
  categories: CategoryResult[];
  defaultReferenceDiscipline?: DisciplineId;
}

export function CategoryRadarChart({
  careerName,
  categories,
  defaultReferenceDiscipline,
}: CategoryRadarChartProps) {
  const [overlayDiscipline, setOverlayDiscipline] = useState<DisciplineId | "none">(
    defaultReferenceDiscipline ?? "none",
  );

  const shareMap = new Map(categories.map((c) => [c.category, c.share]));
  const refShares = overlayDiscipline !== "none" ? referenceCategoryShares(overlayDiscipline) : null;
  const refMeta = overlayDiscipline !== "none" ? getDiscipline(overlayDiscipline) : null;

  const radarData = CC2020_CATEGORIES.map((cat) => {
    const careerPct = Number(((shareMap.get(cat.id) ?? 0) * 100).toFixed(1));
    const refPct = refShares ? Number(((refShares[cat.id] ?? 0) * 100).toFixed(1)) : undefined;
    return {
      subject: cat.nameEs,
      career: careerPct,
      reference: refPct,
    };
  });

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Forma del perfil curricular
            </span>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Gráfica radar de las 6 categorías
            </h2>
          </div>

          <div>
            <label htmlFor="radar-overlay" className="block text-[11px] font-semibold text-slate-600">
              Comparar silueta con disciplina CC2020:
            </label>
            <select
              id="radar-overlay"
              value={overlayDiscipline}
              onChange={(e) => setOverlayDiscipline(e.target.value as DisciplineId | "none")}
              className="mt-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="none">Sin comparación (solo mi carrera)</option>
              {DISCIPLINES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameEs} ({d.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 h-72 w-full" aria-label="Gráfica radar con seis ejes correspondientes a las seis categorías del CC2020">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#1e293b", fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, "auto"]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: "#64748b", fontSize: 10 }}
              />
              <Radar
                name={careerName || "Carrera analizada"}
                dataKey="career"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="#3b82f6"
                fillOpacity={0.35}
              />
              {refMeta && (
                <Radar
                  name={`Referencia CC2020: ${refMeta.nameEs} (${refMeta.id})`}
                  dataKey="reference"
                  stroke={refMeta.color}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill={refMeta.color}
                  fillOpacity={0.12}
                />
              )}
              <Tooltip
                formatter={(value) => [`${value}%`, "Proporción"]}
                contentStyle={{
                  borderRadius: "12px",
                  borderColor: "#e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explicación educativa para interpretar la gráfica */}
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-slate-700">
        <p className="flex items-center gap-1.5 font-bold text-blue-950">
          <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" aria-hidden="true" />
          ¿Cómo interpretar esta gráfica?
        </p>
        <p className="mt-1 leading-relaxed">
          Cada una de las 6 puntas representa una categoría de computación. Entre más se estira la figura azul hacia una punta, mayor tiempo dedica tu carrera a ese tema. Si una figura es muy amplia en todas direcciones, la carrera es generalista; si apunta con fuerza hacia una o dos esquinas, es más especializada.
        </p>
      </div>
    </div>
  );
}

