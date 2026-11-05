/**
 * RETÍCULA DE DEMOSTRACIÓN (FICTICIA)
 * -----------------------------------
 * Plan de estudios inventado con fines exclusivamente demostrativos, para que
 * los visitantes puedan probar la plataforma sin consumir la API de Gemini.
 * Las clasificaciones materia→área también fueron escritas a mano para esta
 * demostración. NO representa a ninguna universidad real.
 * Los cálculos que se muestran con estos datos sí usan los mismos algoritmos
 * deterministas que un análisis real.
 */
import type { Curriculum, StoredAnalysis, SubjectClassification } from "@/types";

type DemoRow = [
  name: string,
  semester: number,
  credits: number,
  description: string,
  areas: [string, number, string][],
  uncertain?: string,
];

const ROWS: DemoRow[] = [
  // Semestre 1
  ["Cálculo diferencial", 1, 5, "Límites, derivadas y aplicaciones.", []],
  ["Fundamentos de programación", 1, 5, "Algoritmos, variables, estructuras de control, funciones y arreglos en un lenguaje de alto nivel.", [["5.5", 0.9, "Enseña las bases de la programación: variables, ciclos y funciones."]]],
  ["Matemáticas discretas", 1, 5, "Lógica, conjuntos, relaciones, grafos y combinatoria.", [["5.3", 0.4, "Grafos y combinatoria son base para estudiar algoritmos."]]],
  ["Taller de ética", 1, 4, "Ética profesional y responsabilidad social.", [["1.1", 0.8, "Trata la ética y responsabilidad del profesional de la computación."]]],
  ["Fundamentos de investigación", 1, 4, "Metodología de la investigación y redacción académica.", []],
  ["Química", 1, 4, "", []],
  // Semestre 2
  ["Cálculo integral", 2, 5, "", []],
  ["Programación orientada a objetos", 2, 5, "Clases, objetos, herencia, polimorfismo y manejo de excepciones.", [["5.5", 0.5, "Continúa la formación en programación."], ["5.4", 0.3, "Estudia el paradigma orientado a objetos."]]],
  ["Contabilidad financiera", 2, 4, "", [["1.3", 0.2, "Aporta nociones de gestión en organizaciones."]], "El nombre sugiere una materia administrativa con poca relación con computación."],
  ["Álgebra lineal", 2, 5, "", []],
  ["Probabilidad y estadística", 2, 5, "", []],
  ["Física general", 2, 5, "", []],
  // Semestre 3
  ["Cálculo vectorial", 3, 5, "", []],
  ["Estructura de datos", 3, 5, "Pilas, colas, listas, árboles, grafos, ordenamiento y búsqueda.", [["5.3", 0.9, "Estudia estructuras de datos y algoritmos de ordenamiento y búsqueda."]]],
  ["Cultura empresarial", 3, 4, "", [["1.3", 0.3, "Relaciona la tecnología con la gestión empresarial."]], "Poca información sobre su contenido."],
  ["Investigación de operaciones", 3, 4, "", []],
  ["Desarrollo sustentable", 3, 5, "", [["1.1", 0.2, "Considera el impacto social y ambiental."]]],
  ["Principios eléctricos y aplicaciones digitales", 3, 5, "Circuitos eléctricos, electrónica básica y lógica digital.", [["6.3", 0.5, "Estudia circuitos eléctricos y componentes electrónicos."], ["6.2", 0.4, "Introduce compuertas y lógica digital."]]],
  // Semestre 4
  ["Ecuaciones diferenciales", 4, 5, "", []],
  ["Métodos numéricos", 4, 4, "", [["5.3", 0.2, "Implementa algoritmos numéricos."]]],
  ["Tópicos avanzados de programación", 4, 5, "Interfaces gráficas, hilos, programación concurrente y componentes.", [["5.5", 0.4, "Programación avanzada."], ["3.4", 0.3, "Incluye concurrencia con hilos."], ["4.5", 0.2, "Desarrolla interfaces gráficas."]]],
  ["Fundamentos de bases de datos", 4, 5, "Modelo entidad-relación, modelo relacional, normalización y SQL.", [["2.4", 0.9, "Trata el diseño y consulta de bases de datos."]]],
  ["Simulación", 4, 5, "", [["5.3", 0.3, "Usa modelos computacionales y algoritmos de simulación."]], "No hay temario; podría incluir más estadística que computación."],
  ["Arquitectura de computadoras", 4, 5, "Organización del procesador, memoria, buses y entrada/salida.", [["6.1", 0.9, "Estudia cómo está organizado un procesador y su memoria."]]],
  // Semestre 5
  ["Lenguajes y autómatas I", 5, 5, "Expresiones regulares, autómatas finitos y análisis léxico.", [["5.4", 0.6, "Base teórica de los lenguajes de programación."], ["5.3", 0.3, "Incluye teoría de la computación y complejidad."]]],
  ["Fundamentos de telecomunicaciones", 5, 4, "Señales, medios de transmisión y modulación.", [["6.4", 0.4, "Estudia señales y su transmisión."], ["3.5", 0.4, "Introduce la comunicación de datos."]]],
  ["Sistemas operativos", 5, 4, "Procesos, memoria, archivos y planificación.", [["5.2", 0.9, "Estudia cómo funciona un sistema operativo."]]],
  ["Taller de bases de datos", 5, 4, "Procedimientos almacenados, transacciones y administración.", [["2.4", 0.8, "Profundiza en la administración de bases de datos."]]],
  ["Fundamentos de ingeniería de software", 5, 4, "Ciclo de vida, modelos de proceso y metodologías ágiles.", [["4.2", 0.6, "Presenta procesos y metodologías de desarrollo."], ["2.3", 0.3, "Introduce la obtención de requisitos."]]],
  ["Lenguajes de interfaz", 5, 4, "Lenguaje ensamblador y programación de bajo nivel.", [["6.1", 0.5, "Relaciona la programación con el hardware."], ["5.4", 0.4, "Programa en lenguaje ensamblador."]]],
  // Semestre 6
  ["Lenguajes y autómatas II", 6, 5, "Análisis sintáctico y semántico, generación de código.", [["5.4", 0.9, "Estudia la construcción de compiladores."]]],
  ["Redes de computadoras", 6, 5, "Modelo OSI, TCP/IP, direccionamiento y enrutamiento.", [["3.5", 0.9, "Estudia cómo se comunican las computadoras en red."]]],
  ["Taller de sistemas operativos", 6, 4, "", [["5.2", 0.6, "Práctica con sistemas operativos."], ["3.8", 0.3, "Administración de plataformas."]]],
  ["Ingeniería de software", 6, 5, "Requisitos, modelado UML, diseño y pruebas.", [["2.3", 0.3, "Análisis de requisitos."], ["4.3", 0.3, "Modelado con UML."], ["4.4", 0.2, "Diseño de software."], ["4.1", 0.2, "Pruebas de software."]]],
  ["Sistemas programables", 6, 4, "Microcontroladores, sensores y actuadores.", [["3.6", 0.7, "Programa microcontroladores dentro de dispositivos."], ["3.3", 0.2, "Conecta sensores y actuadores."]]],
  ["Taller de investigación I", 6, 4, "", []],
  // Semestre 7
  ["Programación lógica y funcional", 7, 4, "", [["5.4", 0.8, "Estudia otros paradigmas de programación."]]],
  ["Conmutación y enrutamiento en redes de datos", 7, 5, "", [["3.5", 0.9, "Profundiza en redes y su configuración."]]],
  ["Gestión de proyectos de software", 7, 6, "Planeación, estimación, riesgos y control de proyectos.", [["1.5", 0.8, "Enseña a planear y administrar proyectos."]]],
  ["Graficación", 7, 4, "", [["5.1", 0.9, "Estudia gráficos por computadora."]]],
  ["Taller de investigación II", 7, 4, "", []],
  // Semestre 8
  ["Inteligencia artificial", 8, 4, "Búsqueda, representación del conocimiento y aprendizaje automático.", [["3.2", 0.9, "Estudia técnicas de inteligencia artificial."]]],
  ["Administración de redes", 8, 4, "", [["3.5", 0.5, "Administra redes."], ["3.8", 0.3, "Gestiona servidores y servicios."]]],
  ["Programación web", 8, 5, "HTML, CSS, JavaScript, servicios web y frameworks.", [["4.5", 0.9, "Desarrollo de aplicaciones web."]]],
  ["Seguridad informática", 8, 4, "Criptografía, amenazas y controles de seguridad.", [["2.1", 0.5, "Principios de seguridad y criptografía."], ["3.9", 0.4, "Implementa controles de seguridad."]]],
  ["Cómputo en la nube", 8, 4, "", [["3.1", 0.8, "Servicios y sistemas virtuales en la nube."]]],
  // Semestre 9
  ["Residencia profesional", 9, 10, "", [], "Depende del proyecto que realice el estudiante."],
];

export const DEMO_ID = "demo";

export function buildDemoAnalysis(): StoredAnalysis {
  const subjects = ROWS.map(([name, semester, credits, description], i) => ({
    id: `demo-${i + 1}`,
    name,
    semester,
    credits,
    hours: null,
    description,
  }));
  const classifications: SubjectClassification[] = ROWS.map(([, , , , areas, uncertain], i) => ({
    subjectId: `demo-${i + 1}`,
    assignments: areas.map(([areaId, relevance, justification]) => ({ areaId, relevance, justification })),
    uncertain: Boolean(uncertain),
    note: uncertain ?? "",
  }));
  const curriculum: Curriculum = {
    careerName: "Ingeniería en Sistemas Computacionales (DEMO)",
    university: "Universidad de Demostración (ficticia)",
    planYear: "2024",
    subjects,
    source: "demo",
    documentQuality: "good",
  };
  return {
    id: DEMO_ID,
    createdAt: new Date(0).toISOString(),
    isDemo: true,
    curriculum,
    classifications,
  };
}

/** Texto de ejemplo para la captura manual. */
export const MANUAL_EXAMPLE = `Semestre 1
Fundamentos de programación | 5
Matemáticas discretas | 5
Semestre 2
Estructura de datos | 5
Bases de datos | 5`;

