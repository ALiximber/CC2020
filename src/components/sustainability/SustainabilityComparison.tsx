import type { StoredAnalysis } from "@/types";
import { SDGS } from "@/data/sdgs";
import { informationLevel } from "@/lib/sustainability/validate";

export function SustainabilityComparison({ analyses }: { analyses: StoredAnalysis[] }) {
  return <section className="rounded-2xl border border-line bg-surface p-5 space-y-4"><h2 className="text-xl font-bold">Contribuciones posibles a la sustentabilidad</h2><p>Compara posibilidades y evidencia disponible. Más relaciones con ODS no significa que una carrera sea más sustentable. La ausencia de datos no demuestra ausencia de enseñanza.</p>
    <div className="grid gap-4 md:grid-cols-2">{analyses.map(a => {
      const state = a.sustainability?.inputKey === JSON.stringify([1, a.curriculum, a.classifications]) ? a.sustainability : undefined;
      const insights = state?.subjects ?? [];
      const goals = SDGS.filter(g => insights.some(i => i.applications.some(x => x.sdgs.includes(g.id))));
      return <article className="rounded-xl border border-line p-4 space-y-3" key={a.id}><h3 className="font-bold">{a.curriculum.careerName}</h3>
        {!state ? <p>Sin análisis de sustentabilidad. Genéralo desde los resultados de esta carrera.</p> : <><p>Materias analizadas: {insights.length} de {a.curriculum.subjects.length}.</p><p>ODS vinculados: {goals.map(g => `${g.id}. ${g.name}`).join(" · ") || "Sin relaciones disponibles"}</p>
          <details><summary className="cursor-pointer font-semibold">Aplicaciones, especialización y soluciones</summary>{insights.map(i => <p key={i.subjectId} className="mt-2 text-sm"><strong>{a.curriculum.subjects.find(s => s.id === i.subjectId)?.name}: </strong>{i.knowledge.join(", ")}. {i.applications.map(x => `${x.description} Ejemplo: ${x.project}`).join(" ")}</p>)}</details>
          <p>Sectores: {state.learning?.sectors.map(s => s.name).join(" · ") || "Genera proyectos y actividades para explorar sectores profesionales."}</p>
          <details><summary className="cursor-pointer font-semibold">Evidencia documental por materia</summary>{insights.map(i => { const s = a.curriculum.subjects.find(s => s.id === i.subjectId)!; return <div className="mt-3 text-sm" key={i.subjectId}><strong>{s.name} · Nivel {informationLevel(s)}</strong><p>{i.explicit.status === "present" ? "Contenido explícito identificado" : i.explicit.status === "absent" ? "No identificado en el programa completo aportado" : "No verificable"}: {i.explicit.explanation}</p>{i.explicit.evidence.map((quote, j) => <blockquote key={j}>“{quote}”</blockquote>)}<p>Fuente: {s.officialProgram?.reference || (s.description ? "Descripción aportada" : "Solo nombre")}</p></div>; })}</details>
        </>}
      </article>;
    })}</div>
  </section>;
}
