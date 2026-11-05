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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Subir otro documento
        </button>

        <button
          type="button"
          onClick={handleAnalyze}
          className="inline-flex items-center gap-2 rounded-xl bg-action px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-action"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Analizar mi carrera
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">

        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          Revisa tus materias
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ajusta las asignaturas antes de iniciar el análisis.
        </p>

        {activeError && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-tint p-4 text-sm text-danger"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-danger mt-0.5" aria-hidden="true" />
            <p>{activeError}</p>
          </div>
        )}

        <details className="disclosure"><summary>Datos de la carrera</summary>
        <div className="mt-6 grid gap-4 rounded-xl border border-line bg-canvas/70 p-4 sm:grid-cols-3">
          <div>
            <label htmlFor="review-career" className="block text-xs font-semibold text-muted">
              Nombre de la carrera
            </label>
            <input
              id="review-career"
              type="text"
              value={careerName}
              onChange={(e) => setCareerName(e.target.value)}
              placeholder="Ej. Ingeniería en Sistemas Computacionales"
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="review-uni" className="block text-xs font-semibold text-muted">
              Universidad o institución
            </label>
            <input
              id="review-uni"
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Opcional"
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="review-year" className="block text-xs font-semibold text-muted">
              Año o clave del plan
            </label>
            <input
              id="review-year"
              type="text"
              value={planYear}
              onChange={(e) => setPlanYear(e.target.value)}
              placeholder="Opcional"
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        </details>
        {/* Resumen rápido de ponderación */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-tint/60 px-4 py-3 text-xs text-accent">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
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
            className="inline-flex items-center gap-1 rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold text-accent shadow-2xs border border-line hover:bg-tint"
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
              className="rounded-xl border border-line bg-surface overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-line bg-canvas px-4 py-3">
                <h2 className="text-sm font-bold text-ink">
                  {sem ? `Semestre / Periodo ${sem}` : "Materias sin semestre especificado"}
                  <span className="ml-2 rounded-full bg-raised/80 px-2 py-0.5 text-xs font-medium text-muted">
                    {list.length}
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={() => addSubject(sem)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Añadir en este grupo
                </button>
              </div>

              <div className="divide-y divide-line">
                {list.map((s) => {
                  const isExpanded = expandedIds.has(s.id);
                  return (
                    <div key={s.id} className="p-3.5 sm:px-4 hover:bg-canvas/50 transition-colors">
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
                            className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink focus:border-accent focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1">
                            <label htmlFor={`sem-${s.id}`} className="text-xs text-muted">
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
                              className="w-14 rounded-lg border border-line bg-surface px-2 py-1.5 text-center text-xs text-ink focus:border-accent focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <label htmlFor={`cred-${s.id}`} className="text-xs text-muted">
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
                              className="w-16 rounded-lg border border-line bg-surface px-2 py-1.5 text-center text-xs text-ink focus:border-accent focus:outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() => toggleExpanded(s.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-raised"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                                Ocultar detalles
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                                Detalles
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeSubject(s.id)}
                            aria-label={`Eliminar ${s.name || "materia"}`}
                            className="rounded-lg p-1.5 text-muted hover:bg-tint hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-2.5">
                          <label className="mb-3 flex items-center gap-2 text-xs text-muted">
                            Horas
                            <input type="number" min="0.1" max="999" step="any" value={s.hours ?? ""}
                              className="w-20 rounded-lg border border-line px-2 py-2 text-ink"
                              onChange={e => { const hours = e.target.valueAsNumber; updateSubject(s.id, { hours: hours > 0 && hours <= 999 ? hours : null }); }} />
                          </label>
                          <label htmlFor={`desc-${s.id}`} className="block text-xs font-medium text-muted">
                            Descripción o temas principales (opcional, ayuda a clasificar con mayor precisión):
                          </label>
                          <textarea
                            id={`desc-${s.id}`}
                            rows={2}
                            value={s.description}
                            onChange={(e) => updateSubject(s.id, { description: e.target.value })}
                            placeholder="Ej. Diseño de bases de datos relacionales, lenguaje SQL, normalización y transacciones."
                            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
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

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-xs text-muted">
            Cuando todo esté listo, haz clic en <strong>Analizar mi carrera</strong> para relacionar estas asignaturas con las áreas del CC2020.
          </p>
          <button
            type="button"
            onClick={handleAnalyze}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-action px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-action focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Analizar mi carrera
          </button>
        </div>
      </div>
    </div>
  );
}

