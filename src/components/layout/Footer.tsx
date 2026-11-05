import Link from "next/link";
import { ExternalLink, ShieldCheck, BookOpen } from "lucide-react";
import { CC2020_URL } from "@/data/cc2020-reference";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300 print:hidden">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Brújula Curricular CC2020
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Herramienta educativa gratuita para ayudar a estudiantes de preparatoria a explorar qué se aprende en distintas carreras de computación, sin calificar ni jerarquizar universidades.
            </p>
          </div>

          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-white">
              <BookOpen className="h-4 w-4 text-blue-400" aria-hidden="true" />
              Marco académico de referencia
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Basado en las 34 áreas de conocimiento (Tabla 4.1) y los rangos de importancia por disciplina (Tabla 5.3) del reporte{" "}
              <strong className="text-slate-200">Computing Curricula 2020 (CC2020)</strong> de ACM e IEEE Computer Society.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <a
                href={CC2020_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                Documento oficial CC2020 (PDF)
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <Link
                href="/metodologia"
                className="font-medium text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                ¿Cómo funciona nuestro análisis?
              </Link>
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              Privacidad y uso de datos
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              No guardamos tus documentos en ningún servidor ni base de datos. El texto o las imágenes necesarias se transmiten temporalmente a la API de Google Gemini para identificar y clasificar las materias. Evita subir documentos con datos personales sensibles.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p>
            Los porcentajes, índices de semejanza y el mapa bidimensional son estimaciones calculadas por algoritmos propios de esta plataforma a partir de los datos del CC2020; no representan una acreditación ni clasificación oficial de ACM o IEEE.
          </p>
        </div>
      </div>
    </footer>
  );
}
