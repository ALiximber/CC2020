/**
 * TABLA 5.3 DEL CC2020 — "LANDSCAPE OF COMPUTING KNOWLEDGE" (DATOS OFICIALES)
 * ---------------------------------------------------------------------------
 * Fuente: ACM/IEEE-CS (2020). Computing Curricula 2020, Tabla 5.3, p. 64.
 *
 * Cada valor es [mínimo, máximo] de la importancia (escala 0–5) que el comité
 * del CC2020 asignó a cada área de conocimiento para cada disciplina. Según el
 * propio reporte, son las medias aritméticas redondeadas de las opiniones de los
 * miembros del comité (no una encuesta representativa).
 *
 * ⚠️ Estos valores se transcriben SIN MODIFICACIONES. No editar.
 * El orden de las disciplinas en cada fila es: CE, CS, CSEC, IS, IT, SE.
 */

export type DisciplineId = "CE" | "CS" | "CSEC" | "IS" | "IT" | "SE";

export interface Discipline {
  id: DisciplineId;
  nameEn: string;
  nameEs: string;
  descriptionEs: string;
  color: string;
}

export const DISCIPLINES: readonly Discipline[] = [
  {
    id: "CE",
    nameEn: "Computer Engineering",
    nameEs: "Ingeniería en Computación",
    descriptionEs:
      "Diseño y construcción de computadoras y sistemas basados en ellas: combina hardware, software y electrónica.",
    color: "#dc2626",
  },
  {
    id: "CS",
    nameEn: "Computer Science",
    nameEs: "Ciencias de la Computación",
    descriptionEs:
      "Fundamentos teóricos y prácticos de la computación: algoritmos, programación, inteligencia artificial y teoría.",
    color: "#d97706",
  },
  {
    id: "CSEC",
    nameEn: "Cybersecurity",
    nameEs: "Ciberseguridad",
    descriptionEs:
      "Protección de sistemas, redes y datos frente a ataques; incluye aspectos técnicos, humanos y legales.",
    color: "#475569",
  },
  {
    id: "IS",
    nameEn: "Information Systems",
    nameEs: "Sistemas de Información",
    descriptionEs:
      "Uso de la tecnología para resolver necesidades de organizaciones: procesos, datos, gestión y transformación digital.",
    color: "#7c3aed",
  },
  {
    id: "IT",
    nameEn: "Information Technology",
    nameEs: "Tecnologías de la Información",
    descriptionEs:
      "Selección, instalación, integración y administración de infraestructura tecnológica para usuarios y organizaciones.",
    color: "#2563eb",
  },
  {
    id: "SE",
    nameEn: "Software Engineering",
    nameEs: "Ingeniería de Software",
    descriptionEs:
      "Desarrollo sistemático de software confiable y de calidad: requisitos, diseño, pruebas y procesos.",
    color: "#059669",
  },
] as const;

export const DISCIPLINE_IDS: readonly DisciplineId[] = DISCIPLINES.map((d) => d.id);

type Range = readonly [min: number, max: number];
type Row = readonly [CE: Range, CS: Range, CSEC: Range, IS: Range, IT: Range, SE: Range];

/** Tabla 5.3 transcrita fila por fila (id de área → rangos por disciplina). */
export const TABLE_5_3: Readonly<Record<string, Row>> = {
  // 1. Users and Organizations
  "1.1": [[2, 5], [2, 4], [2, 4], [3, 5], [2, 4], [3, 5]],
  "1.2": [[1, 3], [2, 3], [4, 5], [2, 3], [2, 4], [2, 4]],
  "1.3": [[0, 2], [0, 2], [1, 2], [4, 5], [1, 2], [1, 2]],
  "1.4": [[0, 1], [0, 1], [1, 2], [3, 5], [1, 3], [1, 3]],
  "1.5": [[1, 3], [2, 3], [1, 2], [4, 5], [2, 3], [2, 4]],
  "1.6": [[1, 3], [2, 4], [1, 3], [2, 4], [3, 4], [3, 5]],
  // 2. Systems Modeling
  "2.1": [[2, 3], [2, 3], [4, 5], [2, 4], [3, 4], [2, 4]],
  "2.2": [[1, 2], [1, 2], [1, 2], [4, 5], [1, 3], [2, 4]],
  "2.3": [[1, 2], [1, 2], [0, 2], [2, 4], [1, 3], [3, 5]],
  "2.4": [[1, 2], [2, 4], [2, 3], [3, 5], [2, 3], [2, 4]],
  // 3. Systems Architecture and Infrastructure
  "3.1": [[1, 3], [1, 3], [1, 2], [1, 2], [3, 4], [1, 3]],
  "3.2": [[1, 3], [3, 5], [1, 2], [1, 2], [1, 2], [0, 1]],
  "3.3": [[2, 4], [0, 2], [1, 3], [1, 3], [2, 4], [1, 3]],
  "3.4": [[2, 4], [2, 4], [1, 2], [1, 3], [1, 3], [2, 3]],
  "3.5": [[2, 4], [2, 4], [2, 4], [1, 3], [3, 4], [2, 2]],
  "3.6": [[3, 5], [0, 2], [1, 3], [0, 1], [0, 1], [0, 3]],
  "3.7": [[1, 2], [0, 2], [0, 2], [1, 3], [3, 4], [1, 3]],
  "3.8": [[0, 1], [1, 2], [1, 2], [1, 3], [2, 4], [0, 2]],
  "3.9": [[2, 3], [2, 4], [4, 5], [1, 3], [2, 4], [2, 4]],
  // 4. Software Development
  "4.1": [[1, 3], [1, 3], [1, 2], [1, 3], [1, 2], [3, 5]],
  "4.2": [[1, 2], [1, 3], [0, 2], [1, 3], [1, 3], [3, 5]],
  "4.3": [[1, 3], [1, 3], [1, 2], [2, 4], [1, 3], [4, 5]],
  "4.4": [[2, 4], [2, 4], [1, 3], [1, 3], [1, 2], [4, 5]],
  "4.5": [[0, 2], [2, 4], [0, 1], [1, 3], [2, 4], [1, 3]],
  // 5. Software Fundamentals
  "5.1": [[1, 2], [2, 4], [0, 1], [1, 1], [0, 1], [0, 2]],
  "5.2": [[2, 4], [3, 5], [2, 3], [1, 2], [1, 3], [1, 3]],
  "5.3": [[2, 4], [4, 5], [1, 3], [1, 3], [1, 2], [2, 4]],
  "5.4": [[2, 3], [3, 5], [1, 2], [1, 2], [1, 2], [2, 3]],
  "5.5": [[2, 4], [4, 5], [2, 3], [1, 3], [2, 4], [3, 5]],
  "5.6": [[2, 3], [2, 3], [1, 2], [2, 3], [1, 3], [2, 3]],
  // 6. Hardware
  "6.1": [[4, 5], [3, 4], [1, 3], [1, 2], [1, 2], [1, 3]],
  "6.2": [[4, 5], [1, 2], [0, 2], [0, 1], [0, 1], [0, 2]],
  "6.3": [[4, 5], [1, 2], [0, 1], [0, 1], [1, 2], [0, 1]],
  "6.4": [[3, 4], [0, 1], [0, 2], [0, 1], [0, 1], [0, 1]],
};

/** Devuelve [min, max] de la Tabla 5.3 para un área y disciplina. */
export function getReferenceRange(areaId: string, discipline: DisciplineId): Range {
  const row = TABLE_5_3[areaId];
  if (!row) throw new Error(`Área sin datos en la Tabla 5.3: ${areaId}`);
  return row[DISCIPLINE_IDS.indexOf(discipline)];
}

export function getDiscipline(id: DisciplineId): Discipline {
  const d = DISCIPLINES.find((x) => x.id === id);
  if (!d) throw new Error(`Disciplina desconocida: ${id}`);
  return d;
}

export const CC2020_CITATION =
  "CC2020 Task Force. (2020). Computing Curricula 2020: Paradigms for Global Computing Education. ACM / IEEE Computer Society. https://doi.org/10.1145/3467967";

export const CC2020_URL =
  "https://www.acm.org/binaries/content/assets/education/curricula-recommendations/cc2020.pdf";

