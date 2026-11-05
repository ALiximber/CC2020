"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Cpu,
  FileUp,
  GitCompare,
  Sparkles,
} from "lucide-react";
import { CC2020_CATEGORIES } from "@/data/cc2020-areas";
import { DISCIPLINES } from "@/data/cc2020-reference";

interface HeroHomeProps {
  onStartAnalyze: () => void;
  onStartDemo: () => void;
  hasExistingAnalyses?: boolean;
  onContinueExisting?: () => void;
}

export function HeroHome({
  onStartAnalyze,
  onStartDemo,
  hasExistingAnalyses,
  onContinueExisting,
}: HeroHomeProps) {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero principal */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 px-6 py-12 text-white shadow-lg sm:px-12 sm:py-16">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold tracking-wide text-blue-100 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Orientación universitaria basada en ACM / IEEE CC2020
            </span>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Descubre qué aprenderás en tu carrera
            </h1>

            <p className="mt-4 text-base leading-relaxed text-blue-100 sm:text-lg">
              Analiza el plan de estudios de una carrera universitaria y descubre sus principales áreas de conocimiento.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <button
                type="button"
                onClick={onStartAnalyze}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-blue-900 shadow-md transition-transform hover:scale-[1.02] hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800"
              >
                Analizar una carrera
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onStartDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
              >
                <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
                Ver demostración interactiva (sin usar API)
              </button>
            </div>

            <p className="mt-3 text-xs text-blue-200/90">
              La demostración utiliza una retícula ficticia almacenada localmente para que explores todas las gráficas al instante.
            </p>

            {hasExistingAnalyses && onContinueExisting && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={onContinueExisting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-300/40 px-4 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/30"
                >
                  Continuar viendo mis carreras analizadas en esta sesión →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Explicación visual en 3 pasos */}
      <section aria-labelledby="heading-steps" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Así de fácil funciona
          </span>
          <h2 id="heading-steps" className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            De tu folleto o PDF a un mapa claro en 3 pasos
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            No necesitas conocimientos técnicos ni clasificar materias a mano.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <FileUp className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-3xl font-black text-slate-200">01</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              1. Sube tu plan de estudios
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Sube la retícula de la universidad en formato PDF, una foto o captura de pantalla (JPG/PNG), o pega la lista de materias.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                <Cpu className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-3xl font-black text-slate-200">02</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              2. Analizamos sus materias con inteligencia artificial
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Reconocemos las asignaturas, te permitimos revisarlas y las relacionamos con las 34 áreas de conocimiento del estándar internacional CC2020.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <BarChart3 className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-3xl font-black text-slate-200">03</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              3. Descubre hacia qué áreas se orienta tu carrera
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Explora gráficas interactivas, un mapa bidimensional, qué materias sustentan cada resultado y compara varias carreras entre sí.
            </p>
          </div>
        </div>
      </section>

      {/* Las 6 grandes categorías explicadas para estudiantes de preparatoria */}
      <section aria-labelledby="heading-categories" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-10">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              ¿Qué se estudia en computación?
            </span>
            <h2 id="heading-categories" className="mt-1 text-2xl font-bold text-slate-900">
              Las 6 grandes categorías del Computing Curricula 2020
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Aunque las carreras tengan nombres parecidos (Ingeniería en Sistemas, Ciencias de la Computación, Tecnologías de la Información, Ingeniería de Software...), cada plan combina en distinta proporción estas seis áreas:
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CC2020_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.number}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{cat.nameEs}</h3>
                      <span className="block text-[11px] text-slate-500">{cat.nameEn}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">
                    {cat.descriptionEs}
                  </p>
                </div>
                <p className="mt-3 border-t border-slate-200/70 pt-2.5 text-[11px] text-slate-500">
                  <strong className="text-slate-700">Ejemplos:</strong> {cat.examplesEs}
                </p>
              </div>
            ))}
          </div>

          {/* Las 6 disciplinas de referencia */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900">
              Y las 6 disciplinas internacionales de referencia con las que comparamos tu plan:
            </h3>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {DISCIPLINES.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-xs"
                >
                  <span
                    className="mt-0.5 inline-flex h-6 w-11 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white"
                    style={{ backgroundColor: d.color }}
                  >
                    {d.id}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{d.nameEs}</p>
                    <p className="text-[11px] text-slate-500">{d.nameEn}</p>
                    <p className="mt-1 text-slate-600 leading-relaxed">{d.descriptionEs}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-blue-600 shrink-0" aria-hidden="true" />
              <span>
                ¿Tienes duda entre dos universidades o dos carreras? Puedes analizar ambas en la misma sesión y compararlas lado a lado.
              </span>
            </div>
            <Link
              href="/metodologia"
              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Conoce la metodología completa →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

