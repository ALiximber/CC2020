"use client";
import { useEffect, useRef, useState } from "react";
import { Leaf } from "lucide-react";
import { SDGS, SUSTAINABILITY_REFERENCES } from "@/data/sdgs";
import { postJson } from "@/lib/api-client";
import { SubjectBatchSchema, type SustainabilityState } from "@/lib/sustainability/schema";
import { informationLevel, validateSubjects, validateLearning } from "@/lib/sustainability/validate";
import { LearningPanel } from "./LearningPanel";
import type { StoredAnalysis } from "@/types";

export const panelClass = "rounded-2xl border border-line bg-surface p-5 sm:p-7 space-y-4";
export const buttonClass = "rounded-xl bg-action px-4 py-2 text-white font-semibold disabled:opacity-50";
export function inputKey(stored: StoredAnalysis) { return JSON.stringify([1, stored.curriculum, stored.classifications]); }
export function SustainabilityPanel({ stored, onSave }: { stored: StoredAnalysis; onSave: (state: SustainabilityState) => void }) {
  const key = inputKey(stored);
  const state = stored.sustainability?.inputKey === key ? stored.sustainability : undefined;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); }, []);
  const insights = state?.subjects ?? [];
  async function analyze() {
    if (controller.current) return;
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setError("");
    let next: SustainabilityState = state ?? { version: 1, inputKey: key, subjects: [] };
    try {
      const missing = stored.curriculum.subjects.filter(s => !next.subjects.some(i => i.subjectId === s.id));
      for (let i = 0; i < missing.length; i += 8) {
        const subjects = missing.slice(i, i + 8);
        const response = await postJson<{ subjects: unknown; model: string }>("/api/sustainability", { phase: "subjects", careerName: stored.curriculum.careerName, subjects, classifications: stored.classifications.filter(c => subjects.some(s => s.id === c.subjectId)) }, 70000, abort.signal);
        const validated = validateSubjects(SubjectBatchSchema.parse(response).subjects, subjects);
        if (!validated.length) throw new Error("No se recibieron materias válidas. Puedes intentar nuevamente.");
        next = { ...next, subjects: [...next.subjects, ...validated], model: response.model };
        if (abort.signal.aborted) return;
        onSave(next);
      }
    } catch (e) { if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "No se pudo analizar. Intenta de nuevo."); }
    finally { controller.current = null; setBusy(false); }
  }
  const related = SDGS.filter(g => insights.some(i => i.applications.some(a => a.sdgs.includes(g.id))));
  async function learn() {
    if (controller.current) return;
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setError("");
    try {
      const response = await postJson<{ learning: unknown; model: string }>("/api/sustainability", { phase: "learning", careerName: stored.curriculum.careerName, subjects: stored.curriculum.subjects.map(({ officialProgram: _program, ...s }) => ({ ...s, description: s.description.slice(0, 500) })), classifications: stored.classifications }, 70000, abort.signal);
      const learning = validateLearning(response.learning, stored.curriculum.subjects);
      if (!abort.signal.aborted) onSave({ ...(state ?? { version: 1, inputKey: key, subjects: [] }), learning, learningModel: response.model });
    } catch (e) { if (!abort.signal.aborted) setError(e instanceof Error ? e.message : "No se pudieron generar las actividades."); }
    finally { controller.current = null; setBusy(false); }
  }
  return <div className="space-y-5">
    <section className={panelClass} aria-label="Tu carrera y la sustentabilidad">
      <h2 className="flex items-center gap-2 text-2xl font-bold"><Leaf aria-hidden="true" />Tu carrera y la sustentabilidad</h2>
      <p>Explora cómo los conocimientos de {stored.curriculum.careerName} podrían contribuir a desafíos ambientales y sociales. Las aplicaciones propuestas por IA no demuestran que tu universidad enseñe estos contenidos.</p>
      <p className="text-sm text-muted">Nivel 1: nombre · Nivel 2: descripción · Nivel 3: programa oficial aportado. No se calcula una calificación de sustentabilidad.</p>
      <p role="status" aria-live="polite">{busy ? "Analizando… " : ""}{insights.length} de {stored.curriculum.subjects.length} materias analizadas.</p>
      {insights.length < stored.curriculum.subjects.length && <button className={buttonClass} disabled={busy} onClick={analyze}>{insights.length ? "Completar materias pendientes" : "Analizar sustentabilidad con Gemini"}</button>}
      {busy && <button className="ml-3 underline" onClick={() => controller.current?.abort()}>Cancelar</button>}
      {error && <p role="alert" className="text-danger">{error} El análisis CC2020 y los resultados ya obtenidos siguen disponibles.</p>}
      {insights.length > 0 && <p>Entre las posibilidades de esta carrera: {insights.flatMap(i => i.applications.map(a => a.description)).slice(0, 3).join(" ") || "No se identificaron aplicaciones justificadas con los datos disponibles."}</p>}
    </section>
    <section className={panelClass}>
      <h3 className="text-xl font-bold">ODS relacionados: aplicaciones potenciales</h3>
      {!related.length && <p>No hay relaciones disponibles todavía.</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{related.map(g => <details className="rounded-xl border border-line p-3" key={g.id}>
        <summary className="cursor-pointer font-semibold">ODS {g.id} · {g.name}</summary><p className="my-2 text-sm">{g.description}</p>
        {insights.filter(i => i.applications.some(a => a.sdgs.includes(g.id))).map(i => <div key={i.subjectId} className="my-3 text-sm"><strong>{stored.curriculum.subjects.find(s => s.id === i.subjectId)?.name}</strong>{i.applications.filter(a => a.sdgs.includes(g.id)).map((a, j) => <p key={j}>{a.justification} Aplicación profesional: {a.professionalApplication}</p>)}</div>)}
      </details>)}</div>
    </section>
    <section className={panelClass}>
      <h3 className="text-xl font-bold">Materias y sustentabilidad</h3>
      <label className="block">Filtrar por ODS <select value={filter} onChange={e => setFilter(Number(e.target.value))} className="border border-line rounded-lg p-2 bg-surface"><option value={0}>Todos</option>{SDGS.map(g => <option key={g.id} value={g.id}>{g.id}. {g.name}</option>)}</select></label>
      {insights.filter(i => !filter || i.applications.some(a => a.sdgs.includes(filter))).map(i => {
        const subject = stored.curriculum.subjects.find(s => s.id === i.subjectId)!;
        return <details key={i.subjectId} className="rounded-xl border border-line p-4">
          <summary className="cursor-pointer font-semibold">{subject.name} · Nivel {informationLevel(subject)}</summary>
          <div className="mt-3 space-y-3 text-sm"><p>Conocimientos inferidos: {i.knowledge.join(", ")}. Confianza orientativa de IA: {{ high: "alta", medium: "media", low: "baja" }[i.confidence]}.</p>
          <p><strong>Integración explícita: </strong>{{ present: "Contenido identificado en el texto aportado", absent: "No identificado en el programa completo aportado", unknown: "No verificable" }[i.explicit.status]}. {i.explicit.explanation}</p>
          {i.explicit.evidence.map((e, n) => <blockquote key={n} className="border-l-2 border-accent pl-3">“{e}”</blockquote>)}
          {subject.officialProgram && <p>Fuente declarada: {subject.officialProgram.reference}. No se autentica su procedencia.</p>}
          {i.applications.length === 0 && <p>No se identificaron aplicaciones suficientemente justificadas.</p>}
          {i.applications.map((a, n) => <div key={n} className="bg-canvas p-3 rounded-lg space-y-2"><p><strong>Potencial: </strong>{a.description}</p><p>Problema: {a.problem}</p><p>ODS {a.sdgs.join(", ")}: {a.justification}</p><p>Proyecto posible: {a.project}</p></div>)}</div>
        </details>;
      })}
    </section>
    <section className={panelClass}><h3 className="text-xl font-bold">Reflexión ambiental</h3><p>Los centros de datos requieren energía; algunas infraestructuras también usan agua para enfriamiento. La fabricación y el descarte de dispositivos consumen recursos y generan residuos electrónicos. Considera todo su ciclo de vida.</p><p>Antes de usar una IA grande, evalúa si una solución más simple resuelve el problema. Mide el consumo real, evita procesamiento innecesario y revisa accesibilidad, privacidad e inclusión digital. Un beneficio potencial debe comprobarse y compararse con los costos del sistema.</p><p>¿Qué medirías antes y después de implementar tu solución para saber si ayuda?</p>
      <div className="flex flex-wrap gap-4 text-sm">{SUSTAINABILITY_REFERENCES.map(r => <a key={r.url} className="underline text-accent" href={r.url} target="_blank" rel="noreferrer">{r.name}</a>)}</div>
    </section>
    <section className={panelClass}>
      {state?.learning ? <LearningPanel data={state.learning} subjects={stored.curriculum.subjects} /> : <><h3 className="text-xl font-bold">Aprende y aplica tus conocimientos</h3><p>Genera proyectos, decisiones tecnológicas y sectores profesionales relacionados con tus materias.</p><button className={buttonClass} disabled={busy} onClick={learn}>Generar proyectos y actividades</button></>}
    </section>
  </div>;
}
