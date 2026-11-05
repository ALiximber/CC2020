"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";

export type ProcessingStage = "extracting" | "classifying" | "summarizing";

interface ProcessingStepProps {
  stage: ProcessingStage;
  batchInfo?: { done: number; total: number } | null;
  onCancel?: () => void;
}

const MESSAGES = [
  "Estamos identificando las materias...",
  "Relacionando los contenidos con las áreas de computación...",
  "Preparando tus resultados...",
] as const;

/**
 * Pantalla de procesamiento sin porcentajes de progreso inventados.
 * Muestra el estado real de la etapa actual.
 */
export function ProcessingStep({ stage, batchInfo, onCancel }: ProcessingStepProps) {
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    setElapsedSec(0);
    const interval = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  const activeIndex = stage === "extracting" ? 0 : stage === "classifying" ? 1 : 2;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Loader2 className="h-9 w-9 animate-spin" aria-hidden="true" />
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Análisis con inteligencia artificial en curso
        </div>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {MESSAGES[activeIndex]}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {stage === "extracting"
            ? "Estamos leyendo el documento para obtener los nombres, semestres y créditos de cada asignatura."
            : stage === "classifying"
              ? "Analizamos cada materia y la relacionamos con las 34 áreas de conocimiento del marco internacional CC2020."
              : "Calculando el perfil matemático de tu carrera y redactando la explicación en lenguaje sencillo."}
        </p>

        {batchInfo && batchInfo.total > 0 && stage === "classifying" && (
          <p className="mt-3 text-xs font-semibold text-blue-700">
            Materias clasificadas: {batchInfo.done} de {batchInfo.total}
          </p>
        )}

        {/* Lista de etapas */}
        <ol className="mt-7 mx-auto max-w-md space-y-3 text-left">
          {MESSAGES.map((msg, idx) => {
            const isDone = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            return (
              <li
                key={msg}
                className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
                  isCurrent
                    ? "border-blue-200 bg-blue-50/70 font-semibold text-blue-950"
                    : isDone
                      ? "border-emerald-200 bg-emerald-50/40 text-emerald-900"
                      : "border-slate-100 bg-slate-50 text-slate-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" aria-hidden="true" />
                ) : (
                  <span className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300" aria-hidden="true" />
                )}
                <span>{msg}</span>
              </li>
            );
          })}
        </ol>

        {elapsedSec >= 10 && (
          <p className="mt-5 text-xs text-slate-500">
            Los planes con muchas materias pueden tardar entre 15 y 40 segundos en analizarse.
          </p>
        )}

        {onCancel && (
          <div className="mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

