/**
 * ÁREAS DE CONOCIMIENTO DEL CC2020 (DATOS OFICIALES)
 * --------------------------------------------------
 * Fuente: ACM/IEEE-CS Joint Task Force (2020). Computing Curricula 2020 (CC2020):
 * Paradigms for Global Computing Education.
 *   - Tabla 4.1 "Elements of Computing Knowledge" (p. 47 del reporte).
 *   - Tabla 5.3 "Landscape of Computing Knowledge" (p. 64 del reporte), que numera
 *     las 34 áreas dentro de las 6 categorías.
 *
 * Los identificadores (`id`) y los nombres en inglés (`nameEn`) se transcriben
 * literalmente de la Tabla 5.3. Cuando la Tabla 4.1 usa un nombre ligeramente
 * distinto se conserva en `table41Name`.
 *
 * Los nombres y descripciones en español son traducciones/explicaciones propias
 * de esta plataforma para facilitar la lectura; NO forman parte del CC2020.
 */

export type CategoryId = "UO" | "SM" | "SAI" | "SD" | "SF" | "HW";

export interface CC2020Category {
  /** Identificador interno de la plataforma. */
  id: CategoryId;
  /** Número de la categoría en la Tabla 5.3 del CC2020. */
  number: number;
  /** Nombre oficial (CC2020). */
  nameEn: string;
  /** Nombre corto en español (traducción de la plataforma). */
  nameEs: string;
  /** Explicación sencilla para estudiantes (plataforma). */
  descriptionEs: string;
  /** Ejemplos de temas típicos (plataforma). */
  examplesEs: string;
  /** Color usado en gráficas. */
  color: string;
}

export interface CC2020Area {
  /** Identificador oficial tal como aparece en la Tabla 5.3 (p. ej. "3.5"). */
  id: string;
  category: CategoryId;
  /** Nombre oficial (Tabla 5.3). */
  nameEn: string;
  /** Variante del nombre en la Tabla 4.1, si difiere. */
  table41Name?: string;
  /** Traducción al español (plataforma). */
  nameEs: string;
  /** Explicación breve en español (plataforma). */
  descriptionEs: string;
}

export const CC2020_CATEGORIES: readonly CC2020Category[] = [
  {
    id: "UO",
    number: 1,
    nameEn: "Users and Organizations",
    nameEs: "Personas y organizaciones",
    descriptionEs:
      "Estudia cómo la tecnología ayuda a personas, empresas e instituciones: ética, gestión de proyectos, liderazgo y diseño de experiencias para los usuarios.",
    examplesEs: "Ética profesional, administración de proyectos, experiencia de usuario, gestión de TI.",
    color: "#7c3aed",
  },
  {
    id: "SM",
    number: 2,
    nameEn: "Systems Modeling",
    nameEs: "Modelado de sistemas",
    descriptionEs:
      "Aprende a entender un problema antes de construir la solución: analizar requisitos, diseñar sistemas, organizar datos y pensar en la seguridad desde el inicio.",
    examplesEs: "Análisis y diseño de sistemas, requisitos, bases de datos, principios de seguridad.",
    color: "#0891b2",
  },
  {
    id: "SAI",
    number: 3,
    nameEn: "Systems Architecture and Infrastructure",
    nameEs: "Arquitectura e infraestructura",
    descriptionEs:
      "Estudia tecnologías como redes, servidores, la nube y sistemas que permiten que diferentes dispositivos y aplicaciones se comuniquen y funcionen juntos.",
    examplesEs: "Redes, computación en la nube, Internet de las cosas, inteligencia artificial, ciberseguridad aplicada.",
    color: "#2563eb",
  },
  {
    id: "SD",
    number: 4,
    nameEn: "Software Development",
    nameEs: "Desarrollo de software",
    descriptionEs:
      "Se enfoca en cómo construir programas y aplicaciones de calidad en equipo: diseño, pruebas, procesos de trabajo y desarrollo para web o móviles.",
    examplesEs: "Ingeniería de software, pruebas, diseño de software, desarrollo web y móvil.",
    color: "#059669",
  },
  {
    id: "SF",
    number: 5,
    nameEn: "Software Fundamentals",
    nameEs: "Fundamentos de computación",
    descriptionEs:
      "Son las bases de la programación y del funcionamiento de las computadoras: algoritmos, estructuras de datos, lenguajes de programación y sistemas operativos.",
    examplesEs: "Programación, algoritmos, estructuras de datos, sistemas operativos, gráficos.",
    color: "#d97706",
  },
  {
    id: "HW",
    number: 6,
    nameEn: "Hardware",
    nameEs: "Hardware y electrónica",
    descriptionEs:
      "Estudia la parte física de la computación: circuitos, electrónica, diseño digital y cómo está construida una computadora por dentro.",
    examplesEs: "Circuitos eléctricos, electrónica, diseño digital, arquitectura de computadoras.",
    color: "#dc2626",
  },
] as const;

export const CC2020_AREAS: readonly CC2020Area[] = [
  // 1. Users and Organizations
  { id: "1.1", category: "UO", nameEn: "Social Issues and Professional Practice", nameEs: "Aspectos sociales y práctica profesional", descriptionEs: "Ética, impacto social de la tecnología, aspectos legales y responsabilidad profesional." },
  { id: "1.2", category: "UO", nameEn: "Security Policy and Management", nameEs: "Políticas y gestión de la seguridad", descriptionEs: "Normas, políticas y gestión de riesgos de seguridad en una organización." },
  { id: "1.3", category: "UO", nameEn: "IS Management and Leadership", nameEs: "Gestión y liderazgo de sistemas de información", descriptionEs: "Dirección de áreas de tecnología, estrategia y toma de decisiones en las organizaciones." },
  { id: "1.4", category: "UO", nameEn: "Enterprise Architecture", nameEs: "Arquitectura empresarial", descriptionEs: "Cómo se alinean los procesos de negocio, los datos y la tecnología de una empresa." },
  { id: "1.5", category: "UO", nameEn: "Project Management", nameEs: "Administración de proyectos", descriptionEs: "Planeación, tiempos, costos y coordinación de equipos de trabajo." },
  { id: "1.6", category: "UO", nameEn: "User Experience Design", nameEs: "Diseño de experiencia de usuario", descriptionEs: "Diseñar sistemas fáciles y agradables de usar, centrados en las personas." },
  // 2. Systems Modeling
  { id: "2.1", category: "SM", nameEn: "Security Issues and Principles", nameEs: "Principios y problemas de seguridad", descriptionEs: "Conceptos básicos de seguridad: confidencialidad, integridad, amenazas y criptografía." },
  { id: "2.2", category: "SM", nameEn: "Systems Analysis & Design", nameEs: "Análisis y diseño de sistemas", descriptionEs: "Estudiar cómo funciona una organización para diseñar sistemas que la apoyen." },
  { id: "2.3", category: "SM", nameEn: "Requirements Analysis and Specification", table41Name: "Requirements Analysis and Specifications", nameEs: "Análisis y especificación de requisitos", descriptionEs: "Descubrir y documentar qué debe hacer un sistema." },
  { id: "2.4", category: "SM", nameEn: "Data and Information Management", nameEs: "Gestión de datos e información", descriptionEs: "Bases de datos, organización, almacenamiento y consulta de información." },
  // 3. Systems Architecture and Infrastructure
  { id: "3.1", category: "SAI", nameEn: "Virtual Systems and Services", nameEs: "Sistemas y servicios virtuales", descriptionEs: "Virtualización, computación en la nube y servicios en línea." },
  { id: "3.2", category: "SAI", nameEn: "Intelligent Systems (AI)", nameEs: "Sistemas inteligentes (IA)", descriptionEs: "Inteligencia artificial, aprendizaje automático y sistemas que razonan." },
  { id: "3.3", category: "SAI", nameEn: "Internet of Things", nameEs: "Internet de las cosas", descriptionEs: "Objetos y sensores conectados a Internet." },
  { id: "3.4", category: "SAI", nameEn: "Parallel and Distributed Computing", nameEs: "Cómputo paralelo y distribuido", descriptionEs: "Muchas computadoras o procesadores trabajando al mismo tiempo." },
  { id: "3.5", category: "SAI", nameEn: "Computer Networks", nameEs: "Redes de computadoras", descriptionEs: "Cómo se comunican las computadoras: protocolos, Internet y redes locales." },
  { id: "3.6", category: "SAI", nameEn: "Embedded Systems", nameEs: "Sistemas embebidos", descriptionEs: "Computadoras dentro de otros aparatos: autos, electrodomésticos, robots." },
  { id: "3.7", category: "SAI", nameEn: "Integrated Systems Technology", nameEs: "Tecnología de sistemas integrados", descriptionEs: "Integrar distintas aplicaciones y tecnologías para que funcionen juntas." },
  { id: "3.8", category: "SAI", nameEn: "Platform Technologies", nameEs: "Tecnologías de plataforma", descriptionEs: "Equipos, servidores, sistemas y plataformas sobre las que corren las aplicaciones." },
  { id: "3.9", category: "SAI", nameEn: "Security Technology and Implementation", nameEs: "Tecnología e implementación de seguridad", descriptionEs: "Herramientas prácticas de ciberseguridad: firewalls, cifrado, defensa de sistemas." },
  // 4. Software Development
  { id: "4.1", category: "SD", nameEn: "Software Quality, Verification and Validation", nameEs: "Calidad, verificación y validación de software", descriptionEs: "Pruebas y técnicas para asegurar que el software funcione correctamente." },
  { id: "4.2", category: "SD", nameEn: "Software Process", nameEs: "Procesos de software", descriptionEs: "Metodologías para organizar el desarrollo (por ejemplo, ágiles)." },
  { id: "4.3", category: "SD", nameEn: "Software Modeling and Analysis", nameEs: "Modelado y análisis de software", descriptionEs: "Representar el software con modelos y diagramas (por ejemplo, UML)." },
  { id: "4.4", category: "SD", nameEn: "Software Design", nameEs: "Diseño de software", descriptionEs: "Arquitectura y estructura interna de las aplicaciones." },
  { id: "4.5", category: "SD", nameEn: "Platform-Based Development", nameEs: "Desarrollo basado en plataformas", descriptionEs: "Desarrollo para web, dispositivos móviles, videojuegos y otras plataformas." },
  // 5. Software Fundamentals
  { id: "5.1", category: "SF", nameEn: "Graphics and Visualization", nameEs: "Gráficos y visualización", descriptionEs: "Gráficos por computadora, animación y visualización de datos." },
  { id: "5.2", category: "SF", nameEn: "Operating Systems", nameEs: "Sistemas operativos", descriptionEs: "Cómo funcionan Windows, Linux, Android y otros sistemas operativos." },
  { id: "5.3", category: "SF", nameEn: "Data Structures, Algorithms and Complexity", nameEs: "Estructuras de datos, algoritmos y complejidad", descriptionEs: "Formas eficientes de organizar datos y resolver problemas." },
  { id: "5.4", category: "SF", nameEn: "Programming Languages", nameEs: "Lenguajes de programación", descriptionEs: "Cómo se diseñan y funcionan los lenguajes; compiladores y paradigmas." },
  { id: "5.5", category: "SF", nameEn: "Programming Fundamentals", nameEs: "Fundamentos de programación", descriptionEs: "Aprender a programar: variables, condiciones, ciclos y funciones." },
  { id: "5.6", category: "SF", nameEn: "Computing Systems Fundamentals", nameEs: "Fundamentos de sistemas de cómputo", descriptionEs: "Bases de cómo funciona un sistema de cómputo completo." },
  // 6. Hardware
  { id: "6.1", category: "HW", nameEn: "Architecture and Organization", nameEs: "Arquitectura y organización de computadoras", descriptionEs: "Cómo está construido un procesador, la memoria y sus componentes." },
  { id: "6.2", category: "HW", nameEn: "Digital Design", nameEs: "Diseño digital", descriptionEs: "Compuertas lógicas, circuitos digitales y lógica combinacional y secuencial." },
  { id: "6.3", category: "HW", nameEn: "Circuits and Electronics", nameEs: "Circuitos y electrónica", descriptionEs: "Electricidad, componentes electrónicos y análisis de circuitos." },
  { id: "6.4", category: "HW", nameEn: "Signal Processing", nameEs: "Procesamiento de señales", descriptionEs: "Análisis y transformación de señales de audio, imagen o sensores." },
] as const;

export const AREA_IDS: readonly string[] = CC2020_AREAS.map((a) => a.id);

export const CATEGORY_IDS: readonly CategoryId[] = CC2020_CATEGORIES.map((c) => c.id);

const areaMap = new Map(CC2020_AREAS.map((a) => [a.id, a]));
const categoryMap = new Map(CC2020_CATEGORIES.map((c) => [c.id, c]));

export function getArea(id: string): CC2020Area | undefined {
  return areaMap.get(id);
}

export function getCategory(id: CategoryId): CC2020Category {
  const c = categoryMap.get(id);
  if (!c) throw new Error(`Categoría desconocida: ${id}`);
  return c;
}

export function areasOfCategory(id: CategoryId): CC2020Area[] {
  return CC2020_AREAS.filter((a) => a.category === id);
}

