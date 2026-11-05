"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { newId } from "@/lib/analysis/manual-parse";
import { chooseWeighting, WEIGHTING_LABELS } from "@/lib/analysis/weighting";
import type { Curriculum, Subject } from "@/types";

interface ReviewStepProps {
  initialCurriculum: Curriculum;
  onConfirmAnalyze: (curriculum: Curriculum) => void;
  onBackToUpload: () => void;
  errorMessage?: string | null;
}

export function ReviewStep({
  initialCurriculum,
  onConfirmAnalyze,
  onBackToUpload,
  errorMessage,
}: ReviewStepProps) {
  const [careerName, setCareerName] = useState(initialCurriculum.careerName);
  const [university, setUniversity] = useState(initialCurriculum.university);
  const [planYear, setPlanYear] = useState(initialCurriculum.planYear);
  const [subjects, setSubjects] = useState<Subject[]>(initialCurriculum.subjects);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const withDesc = initialCurriculum.subjects.filter((s) => s.description.trim().length > 0).map((s) => s.id);
    return new Set(withDesc);
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const weighting = useMemo(() => chooseWeighting(subjects), [subjects]);

  // Agrupar materias por semestre (null al final).
  const semesterGroups = useMemo(() => {
    const map = new Map<number | null, Subject[]>();
    for (const s of subjects) {
      const key = s.semester && s.semester > 0 ? s.semester : null;
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return a - b;
    });
  }, [subjects]);

  function updateSubject(id: string, patch: Partial<Subject>) {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeSubject(id: string) {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }

  function addSubject(semester: number | null) {
    const created: Subject = {
      id: newId(),
      name: "",
      semester,
      credits: null,
      hours: null,
      description: "",
    };
    setSubjects((prev) => [...prev, created]);
    setExpandedIds((prev) => new Set(prev).add(created.id));
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAnalyze() {
    setLocalError(null);
    const cleaned = subjects
      .map((s) => ({ ...s, name: s.name.trim(), description: s.description.trim() }))
      .filter((s) => s.name.length > 0);

    if (cleaned.length < 2) {
      setLocalError("Agrega al menos 2 materias con nombre antes de iniciar el análisis.");
      return;
    }

    onConfirmAnalyze({
      ...initialCurriculum,
      careerName: careerName.trim() || "Carrera analizada",
      university: university.trim(),
      planYear: planYear.trim(),
      subjects: cleaned,
    });
  }

  const activeError = localError || errorMessage;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToUpload}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Subir otro documento
        </button>

        <button
          type="button"
          onClick={handleAnalyze}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Analizar mi carrera
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Paso 2 de 4 · Revisión de asignaturas
        </span>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Estas son las materias que encontramos
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Revisa que la lista esté completa. Puedes corregir nombres, cambiar créditos, agregar materias faltantes o añadir una breve descripción de lo que se ve en cada una.
        </p>

        {activeError && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
            <p>{activeError}</p>
          </div>
        )}

        {/* Datos generales editables */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3">
          <div>
            <label htmlFor="review-career" className="block text-xs font-semibold text-slate-700">
              Nombre de la carrera
            </label>
            <input
              id="review-career"
              type="text"
              value={careerName}
              onChange={(e) => setCareerName(e.target.value)}
              placeholder="Ej. Ingeniería en Sistemas Computacionales"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="review-uni" className="block text-xs font-semibold text-slate-700">
              Universidad o institución
            </label>
            <input
              id="review-uni"
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Opcional"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="review-year" className="block text-xs font-semibold text-slate-700">
              Año o clave del plan
            </label>
            <input
              id="review-year"
              type="text"
              value={planYear}
              onChange={(e) => setPlanYear(e.target.value)}
              placeholder="Opcional"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Resumen rápido de ponderación */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-blue-950">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            <span>
              <strong>{subjects.length} materias</strong> en lista · Ponderación activa:{" "}
              <strong>{WEIGHTING_LABELS[weighting.method]}</strong>.{" "}
              {weighting.method === "uniform" &&
                "(Si todas las materias tienen créditos, se usarán los créditos como peso; nunca los inventamos.)"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => addSubject(semesterGroups[0]?.[0] ?? 1)}
            className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs border border-blue-200 hover:bg-blue-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Agregar materia
          </button>
        </div>

        {/* Lista agrupada por semestre */}
        <div className="mt-6 space-y-6">
          {semesterGroups.map(([sem, list]) => (
            <section
              key={sem ?? "sin-semestre"}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h2 className="text-sm font-bold text-slate-800">
                  {sem ? `Semestre / Periodo ${sem}` : "Materias sin semestre especificado"}
                  <span className="ml-2 rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {list.length}
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={() => addSubject(sem)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Añadir en este grupo
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {list.map((s) => {
                  const isExpanded = expandedIds.has(s.id);
                  return (
                    <div key={s.id} className="p-3.5 sm:px-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                        <div className="flex-1 min-w-0">
                          <label htmlFor={`name-${s.id}`} className="sr-only">
                            Nombre de la materia
                          </label>
                          <input
                            id={`name-${s.id}`}
                            type="text"
                            value={s.name}
                            onChange={(e) => updateSubject(s.id, { name: e.target.value })}
                            placeholder="Nombre de la materia (ej. Estructuras de datos)"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1">
                            <label htmlFor={`sem-${s.id}`} className="text-xs text-slate-500">
                              Sem:
                            </label>
                            <input
                              id={`sem-${s.id}`}
                              type="number"
                              min={1}
                              max={20}
                              value={s.semester ?? ""}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                updateSubject(s.id, {
                                  semester: Number.isInteger(v) && v >= 1 && v <= 20 ? v : null,
                                });
                              }}
                              placeholder="-"
                              className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <label htmlFor={`cred-${s.id}`} className="text-xs text-slate-500">
                              Créditos:
                            </label>
                            <input
                              id={`cred-${s.id}`}
                              type="number"
                              min={0}
                              max={100}
                              step="0.5"
                              value={s.credits ?? ""}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                updateSubject(s.id, {
                                  credits: Number.isFinite(v) && v > 0 ? v : null,
                                });
                              }}
                              placeholder="-"
                              className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleExpanded(s.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                                Ocultar temario
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                                {s.description ? "Editar temario" : "+ Temario"}
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeSubject(s.id)}
                            aria-label={`Eliminar ${s.name || "materia"}`}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-2.5">
                          <label htmlFor={`desc-${s.id}`} className="block text-xs font-medium text-slate-600">
                            Descripción o temas principales (opcional, ayuda a clasificar con mayor precisión):
                          </label>
                          <textarea
                            id={`desc-${s.id}`}
                            rows={2}
                            value={s.description}
                            onChange={(e) => updateSubject(s.id, { description: e.target.value })}
                            placeholder="Ej. Diseño de bases de datos relacionales, lenguaje SQL, normalización y transacciones."
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-500">
            Cuando todo esté listo, haz clic en <strong>Analizar mi carrera</strong> para relacionar estas asignaturas con las áreas del CC2020.
          </p>
          <button
            type="button"
            onClick={handleAnalyze}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Analizar mi carrera
          </button>
        </div>
      </div>
    </div>
  );
}

