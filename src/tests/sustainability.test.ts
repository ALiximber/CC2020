import { describe, expect, it, vi, beforeEach } from "vitest";
import { informationLevel, validateSubjects, validateLearning } from "@/lib/sustainability/validate";
import { SubjectInsightSchema, RequestSchema } from "@/lib/sustainability/schema";
import type { SubjectInsight, Learning } from "@/lib/sustainability/schema";
import type { Subject } from "@/types";
import { AppError } from "@/lib/errors";
import { geminiSchema } from "@/lib/sustainability/gemini-schema";
import { computeAnalysis } from "@/lib/analysis/compute";
import { buildDemoAnalysis } from "@/data/demo-curriculum";

vi.mock("@/lib/gemini/generate", () => ({ generateJson: vi.fn() }));
import { generateJson } from "@/lib/gemini/generate";
import { POST } from "@/app/api/sustainability/route";

const subject: Subject = { id: "db", name: "Bases de datos", semester: 1, credits: 5, hours: null, description: "" };
const insight: SubjectInsight = { subjectId: "db", knowledge: ["SQL"], confidence: "high", explicit: { status: "present", evidence: ["Gestión ambiental con bases de datos"], explanation: "Contenido ambiental" }, applications: [{ description: "Monitoreo del agua", problem: "Fugas", sdgs: [6, 12], justification: "Registrar consumos para detectar anomalías", professionalApplication: "Gestión del agua", project: "Registro de consumos" }] };
const learning: Learning = {
  projects: [{ title: "Monitoreo", problem: "Fugas", solution: "Registrar consumo", subjectIds: ["db"], technologies: ["SQL"], sdgs: [6], objective: "Detectar fugas", benefits: ["Menos desperdicio potencial"], difficulty: "inicial", indicators: ["Litros antes y después"], limitations: ["Consumo de sensores"], additionalKnowledge: ["Electrónica"] }],
  activities: [{ context: "Se registran consumos de agua", question: "¿Qué medir?", options: ["Consumo y costo del sistema", "Solo visitas", "Solo tamaño"], answer: 0, explanation: "Comparar con línea base", tradeoffs: "Costo del monitoreo", subjectIds: ["db"], sdgs: [6] }],
  sectors: [{ name: "Agua", description: "Gestión del agua", problems: ["Fugas"], applications: ["Registro"], subjectIds: ["db"], competencies: ["SQL"], professionalProject: "Monitoreo" }],
};
describe("Evidencia y validación de sustentabilidad", () => {
  it("reduce el esquema del proveedor y conserva las restricciones Zod", () => {
    const schema = JSON.stringify(geminiSchema(SubjectInsightSchema));
    expect(schema).not.toContain("maxLength");
    expect(schema).not.toContain("$schema");
    expect(schema).toContain('"maximum":17');
    expect(SubjectInsightSchema.safeParse({ ...insight, knowledge: ["x".repeat(1801)] }).success).toBe(false);
  });
  it("solo nombres nunca demuestra integración", () => {
    const [result] = validateSubjects([insight], [subject]);
    expect(result.explicit.status).toBe("unknown"); expect(result.confidence).toBe("low");
    expect(informationLevel(subject)).toBe(1);
  });
  it("conserva citas literales temáticas y muestra el nivel de descripción", () => {
    const s = { ...subject, description: insight.explicit.evidence[0] };
    expect(validateSubjects([insight], [s])[0].explicit.status).toBe("present");
    expect(informationLevel(s)).toBe(2);
  });
  it("rechaza citas inventadas y citas sin relación temática", () => {
    expect(validateSubjects([insight], [{ ...subject, description: "SQL y normalización" }])[0].explicit.status).toBe("unknown");
    const unrelated = { ...insight, explicit: { ...insight.explicit, evidence: ["SQL y normalización"] } };
    expect(validateSubjects([unrelated], [{ ...subject, description: "SQL y normalización" }])[0].explicit.status).toBe("unknown");
  });
  it("no declara ausencia con un fragmento o una descripción", () => {
    const absent = { ...insight, explicit: { ...insight.explicit, status: "absent" as const } };
    const program = { text: insight.explicit.evidence[0], reference: "Programa p. 2", complete: false };
    expect(validateSubjects([absent], [{ ...subject, officialProgram: program }])[0].explicit.status).toBe("unknown");
    expect(informationLevel({ ...subject, officialProgram: program })).toBe(3);
  });
  it("elimina materias inventadas y duplicadas, conserva parciales", () => {
    expect(validateSubjects([insight, insight, { ...insight, subjectId: "inventada" }], [subject])).toHaveLength(1);
  });
  it.each([0, 18, 1.5])("rechaza ODS inválido %s", sdg => {
    expect(SubjectInsightSchema.safeParse({ ...insight, applications: [{ ...insight.applications[0], sdgs: [sdg] }] }).success).toBe(false);
  });
  it("rechaza campos incompletos, materias inventadas y respuestas fuera de rango", () => {
    expect(() => validateLearning({}, [subject])).toThrow();
    expect(() => validateLearning(learning, [subject])).not.toThrow();
    expect(() => validateLearning(learning, [{ ...subject, id: "other" }])).toThrow();
    expect(() => validateLearning({ ...learning, activities: [{ ...learning.activities[0], answer: 3 }] }, [subject])).toThrow();
  });
  it("limita lotes y evita IDs duplicados", () => {
    expect(RequestSchema.safeParse({ careerName: "Carrera", phase: "subjects", subjects: [subject, subject], classifications: [] }).success).toBe(false);
  });
  it("no altera los cálculos CC2020", () => {
    const demo = buildDemoAnalysis(); const original = computeAnalysis(demo.curriculum, demo.classifications);
    demo.curriculum.subjects[0].officialProgram = { text: "Desarrollo sostenible", reference: "Programa", complete: true };
    expect(computeAnalysis(demo.curriculum, demo.classifications)).toEqual(original);
  });
});
describe("API complementaria", () => {
  beforeEach(() => { vi.mocked(generateJson).mockReset(); });
  const request = (phase = "subjects") => new Request("http://localhost/api/sustainability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phase, careerName: "Sistemas", subjects: [subject], classifications: [] }) });
  it("devuelve resultados y neutraliza evidencia sin fuente", async () => {
    vi.mocked(generateJson).mockResolvedValue({ data: { subjects: [insight] }, model: "test" });
    const response = await POST(request()); expect(response.status).toBe(200);
    expect((await response.json()).subjects[0].explicit.status).toBe("unknown");
  });
  it("devuelve aprendizaje validado", async () => {
    vi.mocked(generateJson).mockResolvedValue({ data: learning, model: "test" });
    const response = await POST(request("learning")); expect(response.status).toBe(200);
    expect((await response.json()).learning.activities[0].answer).toBe(0);
  });
  it("maneja cuotas sin filtrar errores internos", async () => {
    vi.mocked(generateJson).mockRejectedValue(new AppError("QUOTA", "detalle privado", true));
    const response = await POST(request()); expect(response.status).toBe(429);
    expect(await response.text()).not.toContain("detalle privado");
  });
  it("rechaza respuestas educativas con materias inexistentes", async () => {
    vi.mocked(generateJson).mockResolvedValue({ data: { ...learning, sectors: [{ ...learning.sectors[0], subjectIds: ["falsa"] }] }, model: "test" });
    expect((await POST(request("learning"))).status).not.toBe(200);
  });
  it("rechaza peticiones inválidas antes de llamar Gemini", async () => {
    const response = await POST(new Request("http://localhost/api/sustainability", { method: "POST", body: "{}" }));
    expect(response.status).toBe(400); expect(generateJson).not.toHaveBeenCalled();
  });
});
