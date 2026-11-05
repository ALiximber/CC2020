"use client";

import { useMemo, useState } from "react";
import { AlertCircle, BookOpen, HelpCircle, Search } from "lucide-react";
import { CC2020_CATEGORIES, getArea, getCategory, type CategoryId } from "@/data/cc2020-areas";
import { sanitizeAssignments } from "@/lib/analysis/sanitize";
import type { AnalysisResult, Curriculum, SubjectClassification } from "@/types";

interface TraceabilitySectionProps {
  curriculum: Curriculum;
  classifications: SubjectClassification[];
  result: AnalysisResult;
  onEditSubjects?: () => void;
}

export function TraceabilitySection({
  curriculum,
  classifications,
  result,
  onEditSubjects,
}: TraceabilitySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "ALL" | "UNCLASSIFIED">("ALL");
  const [search, setSearch] = useState("");

  const clsById = useMemo(
    () => new Map(classifications.map((c) => [c.subjectId, c])),
    [classifications],
  );

  const enrichedSubjects = useMemo(() => {
    return curriculum.subjects.map((subj) => {
      const cls = clsById.get(subj.id);
      const assignments = cls ? sanitizeAssignments(cls.assignments) : [];
      const categories = new Set<CategoryId>();
      for (const a of assignments) {
        const area = getArea(a.areaId);
        if (area) categories.add(area.category);
      }
      return {
        subject: subj,
        assignments,
        categories,
        uncertain: cls?.uncertain ?? false,
        note: cls?.note ?? "",
      };
    });
  }, [curriculum.subjects, clsById]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrichedSubjects.filter((item) => {
      if (q && !item.subject.name.toLowerCase().includes(q)) return false;
      if (selectedCategory === "ALL") return true;
      if (selectedCategory === "UNCLASSIFIED") return item.assignments.length === 0;
      return item.categories.has(selectedCategory);
    });
  }, [enrichedSubjects, selectedCategory, search]);

  return (
    <section
      aria-labelledby="heading-traceability"
      className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Transparencia y trazabilidad académica
          </span>
          <h2 id="heading-traceability" className="mt-1 text-xl font-bold text-ink sm:text-2xl">
            ¿Por qué obtuvimos estos resultados?
          </h2>
          <p className="mt-1 text-sm text-muted">
            Aquí puedes consultar cada materia de tu retícula, con qué áreas del CC2020 se relacionó y la razón de esa clasificación.
          </p>
        </div>

        {onEditSubjects && (
          <button
            type="button"
            onClick={onEditSubjects}
            className="self-start sm:self-auto rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-semibold text-muted hover:bg-raised print:hidden"
          >
            Editar materias o agregar temarios
          </button>
        )}
      </div>

      {/* Filtros por categoría y buscador */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar materias por categoría">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === "ALL"
                ? "bg-action text-white"
                : "bg-raised text-muted hover:bg-raised"
            }`}
          >
            Todas ({curriculum.subjects.length})
          </button>
          {CC2020_CATEGORIES.map((cat) => {
            const count = enrichedSubjects.filter((s) => s.categories.has(cat.id)).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-strong text-white"
                    : "bg-raised text-muted hover:bg-raised"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                  aria-hidden="true"
                />
                {cat.nameEs} ({count})
              </button>
            );
          })}
          {result.unclassifiedSubjects.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategory("UNCLASSIFIED")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === "UNCLASSIFIED"
                  ? "bg-strong text-white"
                  : "bg-raised text-muted hover:bg-raised"
              }`}
            >
              Otras ciencias / formación general ({result.unclassifiedSubjects.length})
            </button>
          )}
        </div>

        <div className="relative w-full md:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar materia..."
            aria-label="Buscar materia por nombre"
            className="w-full rounded-xl border border-line py-1.5 pl-9 pr-3 text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Lista de materias y justificaciones */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {filtered.map(({ subject, assignments, uncertain, note }) => (
          <div
            key={subject.id}
            className="flex flex-col justify-between rounded-xl border border-line bg-canvas/50 p-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-ink">{subject.name}</h3>
                  <p className="text-[11px] text-muted">
                    {subject.semester ? `Semestre ${subject.semester}` : "Semestre no indicado"}
                    {subject.credits ? ` · ${subject.credits} créditos` : ""}
                    {subject.hours ? ` · ${subject.hours} horas` : ""}
                  </p>
                </div>
                {uncertain && (
                  <span
                    title={note || "Clasificación aproximada por falta de temario"}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-tint px-2 py-0.5 text-[11px] font-semibold text-warning"
                  >
                    <HelpCircle className="h-3 w-3" aria-hidden="true" />
                    Aproximada
                  </span>
                )}
              </div>

              {subject.description && (
                <p className="mt-2 rounded-lg bg-surface p-2 text-xs text-muted border border-line/70">
                  <strong className="text-muted">Temario:</strong> {subject.description}
                </p>
              )}

              {assignments.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {assignments.map((a) => {
                    const area = getArea(a.areaId);
                    const cat = area ? getCategory(area.category) : null;
                    return (
                      <li
                        key={a.areaId}
                        className="rounded-lg border border-line/90 bg-surface p-2.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                            {cat && (
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color }}
                                aria-hidden="true"
                              />
                            )}
                            <span>
                              {a.areaId} {area?.nameEs ?? a.areaId}
                            </span>
                          </span>
                          <span className="rounded bg-raised px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted">
                            Relevancia: {Math.round(a.relevance * 100)}%
                          </span>
                        </div>
                        {cat && (
                          <p className="mt-0.5 text-[11px] text-muted">
                            Categoría: {cat.nameEs} ({area?.nameEn})
                          </p>
                        )}
                        {a.justification && (
                          <p className="mt-1 text-muted leading-relaxed">
                            {a.justification}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-line bg-surface p-2.5 text-xs text-muted">
                  <BookOpen className="h-4 w-4 shrink-0 text-muted mt-0.5" aria-hidden="true" />
                  <span>
                    Materia de ciencias básicas, matemáticas generales, idiomas o formación transversal. Es parte importante de tu formación universitaria, aunque no se clasifica dentro de las 34 áreas específicas de computación del CC2020.
                  </span>
                </div>
              )}
            </div>

            {uncertain && note && (
              <p className="mt-2.5 flex items-start gap-1.5 border-t border-line/70 pt-2 text-[11px] text-warning">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-warning mt-0.5" aria-hidden="true" />
                <span>Nota sobre esta materia: {note}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

