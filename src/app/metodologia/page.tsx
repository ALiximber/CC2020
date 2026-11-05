import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  Cpu,
  ExternalLink,
  FileSearch,
  Layers,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { CC2020_AREAS, CC2020_CATEGORIES, getCategory } from "@/data/cc2020-areas";
import {
  CC2020_CITATION,
  CC2020_URL,
  DISCIPLINES,
  TABLE_5_3,
} from "@/data/cc2020-reference";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CATEGORY_ANCHORS } from "@/lib/analysis/projection";

export const metadata = {
  title: "¿Cómo funciona nuestro análisis? — Brújula Curricular CC2020",
  description:
    "Conoce la metodología académica y matemática basada en el reporte Computing Curricula 2020 (ACM / IEEE) utilizada para analizar planes de estudio.",
};

export default function MetodologiaPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6 space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al analizador de carreras
          </Link>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            ¿Cómo funciona nuestro análisis?
          </h1>
          <p className="mt-2 text-base leading-relaxed text-muted">
            Explicación transparente de los fundamentos académicos del <strong>Computing Curricula 2020 (CC2020)</strong> y de los algoritmos matemáticos deterministas desarrollados en esta plataforma.
          </p>
        </div>

        {/* 1. Qué es el CC2020 */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tint text-accent">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-bold text-ink">
              1. ¿Qué es el Computing Curricula 2020 (CC2020)?
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            El <strong>Computing Curricula 2020 (CC2020)</strong> es un reporte internacional elaborado conjuntamente por la <strong>Association for Computing Machinery (ACM)</strong> y la <strong>IEEE Computer Society</strong>, las dos organizaciones académicas y profesionales más importantes del mundo en computación. Su objetivo es orientar a universidades, profesores y estudiantes sobre cómo se organizan las distintas áreas y disciplinas de la computación a nivel licenciatura o ingeniería.
          </p>
          <div className="rounded-xl border border-line bg-tint/70 p-4 text-xs text-accent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold">Referencia académica oficial:</p>
              <p className="mt-0.5 text-muted">{CC2020_CITATION}</p>
            </div>
            <a
              href={CC2020_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-action px-4 py-2 text-xs font-semibold text-white hover:bg-action"
            >
              Consultar PDF oficial (ACM)
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* 2. Las 6 disciplinas de referencia */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tint text-accent">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-bold text-ink">
              2. ¿Qué representan sus seis disciplinas de referencia?
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            El análisis comparativo del CC2020 (Capítulo 5) considera las seis disciplinas universitarias de computación que contaban con guías curriculares internacionales aprobadas al momento de su publicación:
          </p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {DISCIPLINES.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-line bg-canvas/70 p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-6 w-12 items-center justify-center rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: d.color }}
                  >
                    {d.id}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{d.nameEs}</h3>
                    <p className="text-xs text-muted">{d.nameEn}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {d.descriptionEs}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Extracción y función de Gemini */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tint text-success">
              <Cpu className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-bold text-ink">
              3. ¿Cómo se extraen las asignaturas y qué función tiene Gemini?
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 text-sm text-muted">
            <div className="rounded-xl border border-line p-4">
              <h3 className="flex items-center gap-1.5 font-bold text-ink">
                <FileSearch className="h-4 w-4 text-accent" aria-hidden="true" />
                Etapa A: Lectura y extracción
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Si subes un PDF con texto digital, tu propio navegador extrae el texto usando <strong>PDF.js</strong>. Si subes una imagen o un PDF escaneado, las páginas se optimizan y se envían a la capacidad multimodal de <strong>Google Gemini</strong> para identificar las materias, semestres y créditos sin inventar datos faltantes. Antes de calcular nada, tú puedes revisar y corregir la lista.
              </p>
            </div>

            <div className="rounded-xl border border-line p-4">
              <h3 className="flex items-center gap-1.5 font-bold text-ink">
                <Cpu className="h-4 w-4 text-accent" aria-hidden="true" />
                Etapa B: Clasificación académica por materia
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Gemini analiza cada asignatura y le asigna entre 0 y 4 áreas de conocimiento de la Tabla 4.1 del CC2020, con un peso de relevancia entre 0 y 1 (cuya suma nunca supera 1) y una justificación breve. <strong>Gemini nunca calcula los porcentajes finales de las gráficas</strong>: todos los números e índices los calculan funciones matemáticas deterministas en TypeScript.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Cómo se calculan los resultados */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tint text-warning">
              <Calculator className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-bold text-ink">
              4. ¿Cómo se calculan los resultados matemáticos?
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-muted leading-relaxed">
            <div className="rounded-xl border border-line bg-canvas p-4">
              <p className="font-bold text-ink">Paso 1 — Ponderación de asignaturas</p>
              <p className="mt-1">
                Si todas las materias cuentan con créditos, el peso <code className="rounded bg-surface px-1">w_m</code> de cada materia es su número de créditos. Si no hay créditos pero todas tienen horas, se usan las horas. En cualquier otro caso se aplica un peso uniforme (<code className="rounded bg-surface px-1">w_m = 1</code>). Nunca se inventan créditos ni horas.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-canvas p-4">
              <p className="font-bold text-ink">
                Paso 2 — Puntaje por área y agrupación en las 6 categorías
              </p>
              <p className="mt-1">
                Para cada una de las 34 áreas <code className="rounded bg-surface px-1">k</code> del CC2020, sumamos el producto del peso de cada materia por la relevancia <code className="rounded bg-surface px-1">r_(m,k)</code> asignada:
              </p>
              <p className="mt-2 rounded-lg bg-surface p-2.5 font-mono text-xs text-ink border border-line">
                Puntaje(k) = Σ_m [ w_m × r_(m,k) ]
              </p>
              <p className="mt-2">
                Posteriormente normalizamos los 34 puntajes para que sumen 1 (obteniendo el perfil curricular <code className="rounded bg-surface px-1">P</code> de la carrera) y sumamos las áreas dentro de cada una de las 6 categorías del CC2020.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-canvas p-4">
              <p className="font-bold text-ink">
                Paso 3 — Comparación con perfiles de referencia (Similitud coseno)
              </p>
              <p className="mt-1">
                La Tabla 5.3 del CC2020 define un rango <code className="rounded bg-surface px-1">[Min, Max]</code> en escala 0 a 5 para cada área y disciplina. Para cada disciplina <code className="rounded bg-surface px-1">d</code> calculamos el punto medio <code className="rounded bg-surface px-1">M_(d,k) = (Min + Max) / 2</code>, normalizamos el vector resultante <code className="rounded bg-surface px-1">R_d</code> para que sume 1 y calculamos la <strong>similitud coseno</strong> con el perfil <code className="rounded bg-surface px-1">P</code> de tu carrera:
              </p>
              <p className="mt-2 rounded-lg bg-surface p-2.5 font-mono text-xs text-ink border border-line">
                Índice(d) = redondear( 100 × (P · R_d) / (||P|| × ||R_d||) )
              </p>
              <p className="mt-2 text-xs text-muted">
                Este valor se presenta como un <strong>índice de semejanza calculado por la aplicación</strong> (de 0 a 100) y no como un porcentaje de pertenencia oficial.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-canvas p-4">
              <p className="flex items-center gap-1.5 font-bold text-ink">
                <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                Paso 4 — Proyección al mapa curricular bidimensional
              </p>
              <p className="mt-1">
                Inspirados en la Figura 2.2 del CC2020 (que organiza la computación horizontalmente de <em>Hardware → Software → Necesidades organizacionales</em> y verticalmente de <em>Fundamentos → Tecnología → Actividad en el dominio</em>), asignamos coordenadas ancla fijas a cada categoría y calculamos el promedio ponderado por la proporción de cada categoría tanto para las 6 disciplinas como para tu carrera:
              </p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse bg-surface rounded-lg overflow-hidden border border-line">
                  <thead>
                    <tr className="border-b border-line bg-raised text-muted">
                      <th className="p-2">Categoría</th>
                      <th className="p-2">Ancla X</th>
                      <th className="p-2">Ancla Y</th>
                      <th className="p-2">Interpretación espacial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {CC2020_CATEGORIES.map((c) => {
                      const a = CATEGORY_ANCHORS[c.id];
                      return (
                        <tr key={c.id}>
                          <td className="p-2 font-semibold">{c.nameEs}</td>
                          <td className="p-2 font-mono">{a.x}</td>
                          <td className="p-2 font-mono">{a.y}</td>
                          <td className="p-2 text-muted">{a.reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Tabla oficial completa de las 34 áreas y la Tabla 5.3 del CC2020 */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-ink">
            5. Las 34 áreas de conocimiento y valores oficiales de la Tabla 5.3 del CC2020
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            A continuación puedes consultar íntegramente las 34 áreas de conocimiento de la Tabla 4.1 y los intervalos <code className="rounded bg-raised px-1">Min–Max</code> de la Tabla 5.3 (página 64 del reporte oficial CC2020) que utiliza nuestro sistema sin modificaciones:
          </p>

          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line bg-canvas text-muted">
                  <th className="p-2.5 font-bold">ID</th>
                  <th className="p-2.5 font-bold">Categoría</th>
                  <th className="p-2.5 font-bold">Área en español / Nombre oficial CC2020</th>
                  <th className="p-2.5 font-bold text-center">CE</th>
                  <th className="p-2.5 font-bold text-center">CS</th>
                  <th className="p-2.5 font-bold text-center">CSEC</th>
                  <th className="p-2.5 font-bold text-center">IS</th>
                  <th className="p-2.5 font-bold text-center">IT</th>
                  <th className="p-2.5 font-bold text-center">SE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {CC2020_AREAS.map((area) => {
                  const cat = getCategory(area.category);
                  const row = TABLE_5_3[area.id];
                  return (
                    <tr key={area.id} className="hover:bg-canvas/70">
                      <td className="p-2.5 font-mono font-bold text-ink">{area.id}</td>
                      <td className="p-2.5">
                        <span
                          className="inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.id}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <p className="font-semibold text-ink">{area.nameEs}</p>
                        <p className="text-[11px] text-muted">{area.nameEn}</p>
                      </td>
                      {row.map(([min, max], idx) => (
                        <td
                          key={idx}
                          className="p-2.5 text-center font-mono text-muted"
                        >
                          {min}–{max}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Limitaciones y privacidad */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-raised text-muted">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-bold text-ink">
              6. Limitaciones y privacidad
            </h2>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-muted list-disc pl-5 leading-relaxed">
            <li>
              <strong>Orientación vocacional, no ranking de calidad:</strong> un porcentaje mayor en una categoría significa que el plan de estudios le dedica más asignaturas o créditos, no que la universidad sea mejor o peor.
            </li>
            <li>
              <strong>Importancia de los temarios:</strong> cuando una retícula solo muestra los nombres de las asignaturas, la clasificación es una estimación basada en lo que habitualmente cubren esas materias. Agregar descripciones o temarios en la pantalla de revisión mejora el respaldo documental.
            </li>
            <li>
              <strong>Privacidad:</strong> nuestra plataforma no utiliza cuentas de usuario ni bases de datos para guardar tus archivos. El texto o las imágenes de la retícula se envían únicamente durante la solicitud a la API de Google Gemini para extraer y clasificar las asignaturas. No subas documentos con datos personales sensibles.
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}

