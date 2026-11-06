"use client";
import { useState, useId } from "react";
import type { Learning } from "@/lib/sustainability/schema";
import type { Subject } from "@/types";

function Activity({ activity, names }: { activity: Learning["activities"][number]; names: string }) {
  const id = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  return <article className="rounded-xl border border-line p-4 space-y-3">
    <p>{activity.context}</p><fieldset disabled={checked}><legend className="font-bold">{activity.question}</legend>
      {activity.options.map((option, index) => <label key={index} className="flex gap-2 p-2 cursor-pointer"><input type="radio" name={id} checked={choice === index} onChange={() => setChoice(index)} />{option}</label>)}
    </fieldset>
    {!checked ? <button className="rounded-lg bg-action text-white px-3 py-2 disabled:opacity-50" disabled={choice === null} onClick={() => setChecked(true)}>Comprobar respuesta</button> : <div role="status" className="rounded-lg bg-tint p-3 space-y-2">
      <p className="font-semibold">{choice === activity.answer ? "Es la opción más adecuada en este contexto." : `Revisa la opción: ${activity.options[activity.answer]}`}</p><p>{activity.explanation}</p><p>Compromisos: {activity.tradeoffs}</p><button className="underline" onClick={() => { setChecked(false); setChoice(null); }}>Intentar nuevamente</button>
    </div>}
    <p className="text-sm text-muted">Materias: {names} · ODS {activity.sdgs.join(", ")}</p>
  </article>;
}
export function LearningPanel({ data, subjects }: { data: Learning; subjects: Subject[] }) {
  const names = (ids: string[]) => ids.map(id => subjects.find(s => s.id === id)?.name).join(", ");
  return <div className="space-y-6">
    <section className="space-y-3"><h3 className="text-xl font-bold">Proyectos sustentables para tu carrera</h3>
      {data.projects.map((p, i) => <details key={i} className="rounded-xl border border-line p-4"><summary className="font-semibold cursor-pointer">{p.title} · Dificultad {p.difficulty}</summary><dl className="mt-3 space-y-3 text-sm">
        {Object.entries({ Problema: p.problem, Solución: p.solution, Objetivo: p.objective, Materias: names(p.subjectIds), Tecnologías: p.technologies.join(", "), ODS: p.sdgs.join(", "), "Beneficios potenciales": p.benefits.join(" · "), "Indicadores a medir": p.indicators.join(" · "), "Limitaciones y efectos negativos": p.limitations.join(" · "), "Conocimientos adicionales": p.additionalKnowledge.join(", ") || "No especificados; revisa la viabilidad con tu docente." }).map(([label, value]) => <div key={label}><dt className="font-bold">{label}</dt><dd>{value}</dd></div>)}
      </dl></details>)}
    </section>
    <section className="space-y-3"><h3 className="text-xl font-bold">Decisiones tecnológicas con impacto</h3>{data.activities.map((a, i) => <Activity key={i} activity={a} names={names(a.subjectIds)} />)}</section>
    <section className="space-y-3"><h3 className="text-xl font-bold">Oportunidades profesionales</h3><p className="text-sm text-muted">Sectores sugeridos; no son ofertas de trabajo ni garantías de empleabilidad.</p>{data.sectors.map((s, i) => <details key={i} className="rounded-xl border border-line p-4"><summary className="font-semibold cursor-pointer">{s.name}</summary><div className="mt-3 space-y-2 text-sm"><p>{s.description}</p><p>Problemas: {s.problems.join(" · ")}</p><p>Aplicaciones: {s.applications.join(" · ")}</p><p>Materias: {names(s.subjectIds)}</p><p>Competencias útiles: {s.competencies.join(", ")}</p><p>Proyecto profesional: {s.professionalProject}</p></div></details>)}</section>
  </div>;
}
