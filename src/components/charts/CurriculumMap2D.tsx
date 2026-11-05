"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Compass, Info } from "lucide-react";
import { CC2020_CATEGORIES, getCategory, type CategoryId } from "@/data/cc2020-areas";
import { DISCIPLINES } from "@/data/cc2020-reference";
import { CATEGORY_ANCHORS, projectToMap } from "@/lib/analysis/projection";
import { referenceCategoryShares } from "@/lib/cc2020/reference-profiles";
import type { MapPoint } from "@/types";

export interface ExtraCareerMapItem {
  id: string;
  label: string;
  point: MapPoint;
  shares: Record<CategoryId, number>;
  color: string;
}

interface CurriculumMap2DProps {
  careerName: string;
  careerPoint: MapPoint;
  careerShares: Record<CategoryId, number>;
  extraCareers?: ExtraCareerMapItem[];
}

interface PlottedNode {
  id: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  description: string;
  point: MapPoint;
  shares: Record<CategoryId, number>;
  color: string;
  kind: "career" | "extra" | "discipline";
}

export function CurriculumMap2D({
  careerName,
  careerPoint,
  careerShares,
  extraCareers = [],
}: CurriculumMap2DProps) {
  const [selectedId, setSelectedId] = useState<string>("career");
  const [showMethodDetails, setShowMethodDetails] = useState(false);

  const nodes = useMemo<PlottedNode[]>(() => {
    const disciplineNodes: PlottedNode[] = DISCIPLINES.map((d) => {
      const shares = referenceCategoryShares(d.id);
      const point = projectToMap(shares);
      return {
        id: d.id,
        shortLabel: d.id,
        title: `${d.nameEs} (${d.id})`,
        subtitle: `Disciplina de referencia CC2020 — ${d.nameEn}`,
        description: d.descriptionEs,
        point,
        shares,
        color: d.color,
        kind: "discipline",
      };
    });

    const extraNodes: PlottedNode[] = extraCareers.map((ec, i) => ({
      id: `extra-${ec.id}`,
      shortLabel: `C${i + 2}`,
      title: ec.label,
      subtitle: "Carrera comparada en esta sesión",
      description:
        "Ubicación calculada con la misma proyección matemática a partir de la distribución de sus materias.",
      point: ec.point,
      shares: ec.shares,
      color: ec.color,
      kind: "extra",
    }));

    const mainNode: PlottedNode = {
      id: "career",
      shortLabel: "TU CARRERA",
      title: careerName || "Tu carrera analizada",
      subtitle: "Plan de estudios analizado",
      description:
        "Este punto resume hacia dónde se inclina el contenido de computación de tu plan de estudios según las 6 categorías del CC2020.",
      point: careerPoint,
      shares: careerShares,
      color: "#1d4ed8",
      kind: "career",
    };

    return [...disciplineNodes, ...extraNodes, mainNode];
  }, [careerName, careerPoint, careerShares, extraCareers]);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? nodes[nodes.length - 1];

  // Las disciplinas oficiales y las carreras suelen ubicarse en el rango [-0.55, 0.55].
  // Escalamos ese rango dentro del lienzo SVG para que los puntos se distingan con claridad,
  // manteniendo el origen (0,0) exactamente en el centro.
  const DOMAIN = 0.6;
  const toSvgX = (x: number) => {
    const clamped = Math.max(-DOMAIN, Math.min(DOMAIN, x));
    return 90 + ((clamped + DOMAIN) / (2 * DOMAIN)) * 520;
  };
  const toSvgY = (y: number) => {
    const clamped = Math.max(-DOMAIN, Math.min(DOMAIN, y));
    // En SVG y crece hacia abajo; en nuestro mapa +y (Organizaciones) va arriba.
    return 60 + ((DOMAIN - clamped) / (2 * DOMAIN)) * 300;
  };

  const topCategoriesOfSelected = Object.entries(selectedNode.shares)
    .map(([cat, share]) => ({ cat: cat as CategoryId, share }))
    .sort((a, b) => b.share - a.share)
    .slice(0, 3);

  return (
    <section
      aria-labelledby="heading-map-2d"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Inspirado en la Figura 2.2 del CC2020
          </span>
          <h2 id="heading-map-2d" className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Mapa curricular bidimensional
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Visualiza dónde se ubica tu carrera frente a las seis disciplinas de referencia, desde el hardware y los fundamentos hasta los sistemas y las necesidades organizacionales.
          </p>
        </div>
      </div>

      {/* Aviso obligatorio visible */}
      <div
        role="note"
        className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-950"
      >
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
        <p className="font-medium">
          Este mapa es una representación estimada basada en el CC2020 y no una clasificación espacial oficial.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Lienzo SVG interactivo */}
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-2 sm:p-4">
            <svg
              viewBox="0 0 700 420"
              role="img"
              aria-label="Mapa curricular bidimensional con las seis disciplinas del CC2020 y la carrera analizada"
              className="h-auto w-full select-none"
            >
              <defs>
                <radialGradient id="careerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Marco del área de trazado */}
              <rect
                x="90"
                y="60"
                width="520"
                height="300"
                rx="16"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />

              {/* Regiones conceptuales de fondo (inspiradas en la Figura 2.2) */}
              <ellipse
                cx="225"
                cy="275"
                rx="110"
                ry="68"
                fill="#fee2e2"
                fillOpacity="0.45"
                stroke="#fca5a5"
                strokeDasharray="4 4"
              />
              <text x="165" y="325" fontSize="10" fontWeight="600" fill="#b91c1c">
                Enfoque en Hardware
              </text>

              <ellipse
                cx="350"
                cy="240"
                rx="125"
                ry="82"
                fill="#d1fae5"
                fillOpacity="0.4"
                stroke="#6ee7b7"
                strokeDasharray="4 4"
              />
              <text x="350" y="308" textAnchor="middle" fontSize="10" fontWeight="600" fill="#047857">
                Software y Fundamentos
              </text>

              <ellipse
                cx="315"
                cy="185"
                rx="125"
                ry="68"
                fill="#dbeafe"
                fillOpacity="0.4"
                stroke="#93c5fd"
                strokeDasharray="4 4"
              />
              <text x="245" y="138" fontSize="10" fontWeight="600" fill="#1d4ed8">
                Sistemas e Infraestructura
              </text>

              <ellipse
                cx="475"
                cy="145"
                rx="115"
                ry="68"
                fill="#ede9fe"
                fillOpacity="0.45"
                stroke="#c4b5fd"
                strokeDasharray="4 4"
              />
              <text x="480" y="102" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6d28d9">
                Organizaciones y Datos
              </text>

              {/* Líneas guía centrales */}
              <line
                x1="90"
                y1="210"
                x2="610"
                y2="210"
                stroke="#cbd5e1"
                strokeDasharray="3 3"
              />
              <line
                x1="350"
                y1="60"
                x2="350"
                y2="360"
                stroke="#cbd5e1"
                strokeDasharray="3 3"
              />

              {/* Etiquetas del eje vertical (izquierda): niveles de la Figura 2.2 */}
              <g fontSize="10.5" fontWeight="700" fill="#334155" textAnchor="end">
                <text x="80" y="105">Actividad en</text>
                <text x="80" y="118">organizaciones</text>

                <text x="80" y="206">Tecnologías</text>
                <text x="80" y="219">aplicadas</text>

                <text x="80" y="310">Fundamentos</text>
                <text x="80" y="323">de computación</text>
              </g>

              {/* Etiquetas del eje horizontal (abajo): Hardware → Software → Necesidades organizacionales */}
              <g fontSize="11" fontWeight="700" fill="#334155">
                <text x="155" y="385" textAnchor="middle">
                  ← Hardware
                </text>
                <text x="350" y="385" textAnchor="middle">
                  Software / Sistemas
                </text>
                <text x="530" y="385" textAnchor="middle">
                  Necesidades organizacionales →
                </text>
              </g>

              {/* Título superior dentro del lienzo */}
              <text x="350" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">
                Panorama de las disciplinas de computación y ubicación de tu carrera
              </text>

              {/* Puntos graficados */}
              {nodes.map((node) => {
                const cx = toSvgX(node.point.x);
                const cy = toSvgY(node.point.y);
                const isSelected = node.id === selectedNode.id;
                const isCareer = node.kind === "career";

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedId(node.id)}
                    className="cursor-pointer"
                  >
                    {isCareer && (
                      <circle cx={cx} cy={cy} r="28" fill="url(#careerGlow)" />
                    )}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isCareer ? 18 : 15}
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="2"
                        strokeDasharray="3 2"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isCareer ? 12 : 9}
                      fill={node.color}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    <g transform={`translate(${cx}, ${cy - (isCareer ? 18 : 14)})`}>
                      <rect
                        x={isCareer ? -46 : -24}
                        y="-14"
                        width={isCareer ? 92 : 48}
                        height="18"
                        rx="5"
                        fill={isCareer ? "#1e3a8a" : "#ffffff"}
                        stroke={node.color}
                        strokeWidth="1.2"
                      />
                      <text
                        x="0"
                        y="-2"
                        textAnchor="middle"
                        fontSize={isCareer ? "9.5" : "10"}
                        fontWeight="800"
                        fill={isCareer ? "#ffffff" : "#0f172a"}
                      >
                        {node.shortLabel}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Botones accesibles por teclado y pantalla táctil para seleccionar cualquier punto */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-200/80 pt-3">
              <span className="mr-1 text-xs font-semibold text-slate-500">
                Seleccionar punto:
              </span>
              {nodes.map((node) => {
                const active = node.id === selectedNode.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedId(node.id)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: node.color }}
                      aria-hidden="true"
                    />
                    {node.kind === "career" ? "Tu carrera" : node.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel lateral con explicación del punto seleccionado */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: selectedNode.color }}
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {selectedNode.subtitle}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedNode.title}
                </h3>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-700">
              {selectedNode.description}
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 text-xs">
              <p className="font-bold text-slate-800">
                ¿Por qué se ubica en esta zona del mapa?
              </p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {selectedNode.point.x < -0.15
                  ? "En el eje horizontal se inclina hacia la izquierda por su peso en hardware, electrónica o arquitectura."
                  : selectedNode.point.x > 0.15
                    ? "En el eje horizontal se inclina hacia la derecha por su atención a procesos, datos y necesidades de las organizaciones."
                    : "En el eje horizontal se mantiene cerca del centro, equilibrando software, sistemas e infraestructura."}{" "}
                {selectedNode.point.y < -0.15
                  ? "En el eje vertical se ubica en la parte inferior por su énfasis en fundamentos teóricos, programación base o hardware."
                  : selectedNode.point.y > 0.1
                    ? "En el eje vertical sube hacia la parte superior por su orientación a la aplicación en organizaciones y usuarios."
                    : "En el eje vertical se sitúa en la franja media de desarrollo tecnológico y sistemas aplicados."}
              </p>

              <div className="mt-3 border-t border-slate-100 pt-2.5">
                <p className="font-semibold text-slate-800">Categorías con mayor peso:</p>
                <ul className="mt-1.5 space-y-1">
                  {topCategoriesOfSelected.map(({ cat, share }) => {
                    const meta = getCategory(cat);
                    return (
                      <li key={cat} className="flex items-center justify-between text-slate-700">
                        <span>{meta.nameEs}</span>
                        <span className="font-bold">{Math.round(share * 100)}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="mt-3 border-t border-slate-100 pt-2 font-mono text-[11px] text-slate-500">
                Coordenadas estimadas: x = {selectedNode.point.x.toFixed(2)}, y ={" "}
                {selectedNode.point.y.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50/80 border border-blue-100 p-3 text-[11px] text-blue-950">
            <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" aria-hidden="true" />
            <span>
              Tanto las 6 disciplinas del CC2020 como tu carrera se ubican aplicando exactamente la misma fórmula matemática a sus perfiles de las 34 áreas.
            </span>
          </div>
        </div>
      </div>

      {/* Documentación transparente de la transformación matemática */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setShowMethodDetails((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"
        >
          {showMethodDetails ? (
            <>
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
              Ocultar regla matemática del mapa bidimensional
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
              Ver cómo se calculan las coordenadas de este mapa (metodología transparente)
            </>
          )}
        </button>

        {showMethodDetails && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-3">
            <p>
              La Figura 2.2 del reporte CC2020 es un diagrama conceptual y no incluye una fórmula oficial para proyectar nuevas carreras. Para construir un mapa transparente y reproducible, asignamos a cada una de las 6 categorías una coordenada ancla <code className="rounded bg-white px-1">(ax, ay)</code> en <code className="rounded bg-white px-1">[-1, 1]²</code> y calculamos el promedio ponderado por la proporción <code className="rounded bg-white px-1">p_c</code> de cada categoría: <code className="rounded bg-white px-1">x = Σ p_c · ax_c</code>, <code className="rounded bg-white px-1">y = Σ p_c · ay_c</code>.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-1.5 pr-3">Categoría CC2020</th>
                    <th className="py-1.5 pr-3">Ancla X</th>
                    <th className="py-1.5 pr-3">Ancla Y</th>
                    <th className="py-1.5">Justificación conceptual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {CC2020_CATEGORIES.map((c) => {
                    const anchor = CATEGORY_ANCHORS[c.id];
                    return (
                      <tr key={c.id}>
                        <td className="py-1.5 pr-3 font-medium text-slate-900">
                          {c.nameEs} ({c.nameEn})
                        </td>
                        <td className="py-1.5 pr-3 font-mono">{anchor.x}</td>
                        <td className="py-1.5 pr-3 font-mono">{anchor.y}</td>
                        <td className="py-1.5 text-slate-600">{anchor.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

