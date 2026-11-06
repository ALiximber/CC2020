"use client";
import { useState } from "react";
import type { Subject } from "@/types";
import { LIMITS } from "@/lib/validation/schemas";

export function ProgramEditor({ subject, onChange }: { subject: Subject; onChange: (patch: Partial<Subject>) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const program = subject.officialProgram ?? { text: "", reference: "", complete: false };
  async function read(file: File) {
    setBusy(true); setError("");
    try {
      if (file.size > LIMITS.maxFileBytes) throw new Error("El archivo supera 15 MB.");
      let text: string;
      if (file.name.toLowerCase().endsWith(".pdf")) {
        const { readPdf } = await import("@/lib/pdf/read-pdf");
        const result = await readPdf(file);
        if (result.isScanned) throw new Error("Este PDF no contiene texto legible. Transcribe el fragmento pertinente y su referencia; no se inferirá evidencia de imágenes.");
        if (result.truncated) throw new Error("El PDF excede el límite de páginas. Carga el programa de esta materia por separado.");
        text = result.text;
      } else if (file.name.toLowerCase().endsWith(".txt")) text = await file.text();
      else throw new Error("Usa un archivo PDF con texto o TXT.");
      if (text.length > 12000) throw new Error("El texto supera 12 000 caracteres. Selecciona un fragmento y no lo marques como programa completo.");
      if (!text.trim()) throw new Error("El archivo no contiene texto.");
      onChange({ officialProgram: { text, reference: file.name, complete: false } });
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo leer el archivo."); }
    finally { setBusy(false); }
  }
  return <details className="mt-3 border border-line rounded-lg p-3 text-sm"><summary className="cursor-pointer font-semibold">Evidencia de sustentabilidad: programa oficial (opcional)</summary><div className="mt-3 space-y-3">
    <p>Adjunta únicamente el programa de esta materia. La procedencia se declara por el usuario; la plataforma no autentica documentos. Se envía el texto a Gemini al analizar sustentabilidad.</p>
    <label className="block">Cargar PDF con texto o TXT<input type="file" accept=".pdf,.txt" disabled={busy} className="block max-w-full" onChange={e => { const file = e.target.files?.[0]; if (file) void read(file); e.target.value = ""; }} /></label>
    {busy && <p role="status">Leyendo documento…</p>}{error && <p role="alert" className="text-danger">{error}</p>}
    <label className="block">Fuente, institución, página o URL<input className="block w-full border border-line rounded-lg p-2" maxLength={500} value={program.reference} onChange={e => onChange({ officialProgram: { ...program, reference: e.target.value } })} /></label>
    <label className="block">Texto del programa o fragmento (máximo 12 000 caracteres)<textarea className="block w-full border border-line rounded-lg p-2" rows={5} maxLength={12000} value={program.text} onChange={e => onChange({ officialProgram: { ...program, text: e.target.value, complete: false } })} /></label>
    <label className="flex gap-2"><input type="checkbox" checked={program.complete} onChange={e => onChange({ officialProgram: { ...program, complete: e.target.checked } })} />Confirmo que el texto incluye el programa completo de esta asignatura, no solo un fragmento.</label>
    {subject.officialProgram && <button type="button" className="underline" onClick={() => onChange({ officialProgram: undefined })}>Quitar evidencia</button>}
  </div></details>;
}
