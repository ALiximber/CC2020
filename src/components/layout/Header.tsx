"use client";

import Link from "next/link";
import { BookOpen, Compass, GitCompare, PlusCircle, RotateCcw } from "lucide-react";

export type FlowStep = "home" | "upload" | "review" | "processing" | "results" | "compare";

interface HeaderProps {
  currentStep?: FlowStep;
  analysesCount?: number;
  onGoHome?: () => void;
  onStartUpload?: () => void;
  onOpenCompare?: () => void;
  onResetAll?: () => void;
}

const STEP_LIST: { id: FlowStep; label: string; number: number }[] = [
  { id: "upload", label: "Subir retícula", number: 1 },
  { id: "review", label: "Revisar materias", number: 2 },
  { id: "processing", label: "Analizar", number: 3 },
  { id: "results", label: "Explorar resultados", number: 4 },
  { id: "compare", label: "Comparar carreras", number: 5 },
];

export function Header({
  currentStep = "home",
  analysesCount = 0,
  onGoHome,
  onStartUpload,
  onOpenCompare,
  onResetAll,
}: HeaderProps) {
  const showStepper = currentStep !== "home";
  const activeStepIndex = STEP_LIST.findIndex((s) => s.id === currentStep);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {onGoHome ? (
            <button
              type="button"
              onClick={onGoHome}
              className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm transition-transform group-hover:scale-105">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <span className="block text-base font-bold tracking-tight text-slate-900">
                  Brújula Curricular
                </span>
                <span className="block text-xs font-medium text-blue-700">
                  Orientación basada en CC2020
                </span>
              </div>
            </button>
          ) : (
            <Link
              href="/"
              className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <span className="block text-base font-bold tracking-tight text-slate-900">
                  Brújula Curricular
                </span>
                <span className="block text-xs font-medium text-blue-700">
                  Orientación basada en CC2020
                </span>
              </div>
            </Link>
          )}
        </div>

        <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-2">
          {analysesCount > 0 && onOpenCompare && (
            <button
              type="button"
              onClick={onOpenCompare}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                currentStep === "compare"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-blue-200 bg-blue-50/70 text-blue-800 hover:bg-blue-100"
              }`}
            >
              <GitCompare className="h-4 w-4" aria-hidden="true" />
              <span>Comparar</span>
              <span className="ml-0.5 rounded-full bg-blue-700/15 px-1.5 py-0.5 text-xs font-bold">
                {analysesCount}
              </span>
            </button>
          )}

          {onStartUpload && currentStep !== "upload" && currentStep !== "processing" && (
            <button
              type="button"
              onClick={onStartUpload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <PlusCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <span className="hidden sm:inline">Analizar carrera</span>
              <span className="sm:hidden">Analizar</span>
            </button>
          )}

          <Link
            href="/metodologia"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <BookOpen className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <span>¿Cómo funciona?</span>
          </Link>

          {analysesCount > 0 && onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              title="Reiniciar todos los análisis de la sesión"
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Reiniciar</span>
            </button>
          )}
        </nav>
      </div>

      {showStepper && (
        <div className="border-t border-slate-100 bg-slate-50/80">
          <div className="mx-auto max-w-6xl overflow-x-auto px-4 py-2 sm:px-6">
            <ol className="flex items-center justify-between gap-2 min-w-[460px] text-xs">
              {STEP_LIST.map((step, idx) => {
                const isActive = step.id === currentStep;
                const isDone = activeStepIndex > idx && currentStep !== "compare";
                return (
                  <li key={step.id} className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white ring-2 ring-blue-200"
                          : isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {step.number}
                    </span>
                    <span
                      className={`font-medium ${
                        isActive ? "text-blue-900 font-semibold" : isDone ? "text-slate-800" : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </span>
                    {idx < STEP_LIST.length - 1 && (
                      <span className="hidden sm:inline-block h-px w-6 bg-slate-300" aria-hidden="true" />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </header>
  );
}

