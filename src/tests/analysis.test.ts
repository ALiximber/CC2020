import { describe, expect, it } from "vitest";
import { AREA_IDS, CC2020_AREAS, CC2020_CATEGORIES } from "@/data/cc2020-areas";
import { DISCIPLINE_IDS, TABLE_5_3 } from "@/data/cc2020-reference";
import { cosineSimilarity, normalizeToSum, sum, toPercentages } from "@/lib/analysis/vector";
import { chooseWeighting } from "@/lib/analysis/weighting";
import { sanitizeAssignments } from "@/lib/analysis/sanitize";
import { computeProfile } from "@/lib/analysis/profile";
import { computeSimilarities } from "@/lib/analysis/similarity";
import { CATEGORY_ANCHORS, projectToMap } from "@/lib/analysis/projection";
import { referenceCategoryShares, referenceMidpoints, referenceProfile } from "@/lib/cc2020/reference-profiles";
import { computeAnalysis } from "@/lib/analysis/compute";
import { compareCareers } from "@/lib/analysis/compare";
import { parseManualSubjects } from "@/lib/analysis/manual-parse";
import { buildDemoAnalysis } from "@/data/demo-curriculum";
import type { Curriculum, Subject, SubjectClassification } from "@/types";

const subj = (id: string, credits: number | null = null, hours: number | null = null): Subject => ({
  id,
  name: id,
  semester: 1,
  credits,
  hours,
  description: "",
});

describe("Datos oficiales CC2020", () => {
  it("tiene 6 categorías y 34 áreas", () => {
    expect(CC2020_CATEGORIES).toHaveLength(6);
    expect(CC2020_AREAS).toHaveLength(34);
    expect(new Set(AREA_IDS).size).toBe(34);
  });
  it("distribución de áreas por categoría: 6, 4, 9, 5, 6, 4", () => {
    const counts = CC2020_CATEGORIES.map((c) => CC2020_AREAS.filter((a) => a.category === c.id).length);
    expect(counts).toEqual([6, 4, 9, 5, 6, 4]);
  });
  it("la Tabla 5.3 tiene un rango válido [min ≤ max] en 0–5 para cada área y disciplina", () => {
    for (const id of AREA_IDS) {
      const row = TABLE_5_3[id];
      expect(row).toHaveLength(6);
      for (const [min, max] of row) {
        expect(min).toBeGreaterThanOrEqual(0);
        expect(max).toBeLessThanOrEqual(5);
        expect(min).toBeLessThanOrEqual(max);
      }
    }
  });
  it("conserva valores puntuales verificados de la Tabla 5.3", () => {
    expect(TABLE_5_3["1.1"][0]).toEqual([2, 5]); // CE
    expect(TABLE_5_3["3.2"][1]).toEqual([3, 5]); // CS – AI
    expect(TABLE_5_3["3.5"][5]).toEqual([2, 2]); // SE – Networks
    expect(TABLE_5_3["6.3"][0]).toEqual([4, 5]); // CE – Circuits
    expect(TABLE_5_3["1.3"][3]).toEqual([4, 5]); // IS – IS Management
  });
});

describe("Operaciones vectoriales", () => {
  it("normaliza a suma 1", () => {
    const v = normalizeToSum([1, 3, 0, 4]);
    expect(sum(v)).toBeCloseTo(1, 12);
    expect(v).toEqual([0.125, 0.375, 0, 0.5]);
  });
  it("el vector cero se normaliza a ceros", () => {
    expect(normalizeToSum([0, 0])).toEqual([0, 0]);
  });
  it("similitud coseno: casos conocidos", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
    expect(cosineSimilarity([1, 1], [1, 0])).toBeCloseTo(Math.SQRT1_2);
    expect(cosineSimilarity([2, 4], [1, 2])).toBeCloseTo(1); // invariante a la escala
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0);
  });
  it("porcentajes enteros que siempre suman 100", () => {
    expect(sum(toPercentages([1 / 3, 1 / 3, 1 / 3]))).toBe(100);
    expect(toPercentages([0.5, 0.25, 0.25])).toEqual([50, 25, 25]);
    expect(sum(toPercentages([0.123, 0.456, 0.421]))).toBe(100);
  });
});

describe("Ponderación", () => {
  it("usa créditos cuando todas las materias los tienen", () => {
    const w = chooseWeighting([subj("a", 5, 4), subj("b", 3, 2)]);
    expect(w.method).toBe("credits");
    expect(w.weights.get("a")).toBe(5);
    expect(w.total).toBe(8);
  });
  it("usa horas si faltan créditos pero todas tienen horas", () => {
    const w = chooseWeighting([subj("a", 5, 4), subj("b", null, 2)]);
    expect(w.method).toBe("hours");
    expect(w.total).toBe(6);
  });
  it("usa peso uniforme si falta información (no inventa créditos)", () => {
    const w = chooseWeighting([subj("a", 5, null), subj("b", null, null)]);
    expect(w.method).toBe("uniform");
    expect(w.weights.get("a")).toBe(1);
    expect(w.total).toBe(2);
  });
});

describe("Depuración de relevancias", () => {
  it("descarta áreas inválidas y reescala si la suma supera 1", () => {
    const out = sanitizeAssignments([
      { areaId: "5.5", relevance: 0.8, justification: "a" },
      { areaId: "5.3", relevance: 0.6, justification: "b" },
      { areaId: "9.9", relevance: 0.5, justification: "x" },
    ]);
    expect(out.map((a) => a.areaId)).toEqual(["5.5", "5.3"]);
    expect(sum(out.map((a) => a.relevance))).toBeCloseTo(1);
    expect(out[0].relevance / out[1].relevance).toBeCloseTo(0.8 / 0.6);
  });
  it("mantiene relevancias cuya suma es menor a 1", () => {
    const out = sanitizeAssignments([{ areaId: "3.5", relevance: 0.4, justification: "" }]);
    expect(out[0].relevance).toBe(0.4);
  });
  it("limita relevancias individuales a 1 y fusiona duplicados", () => {
    const out = sanitizeAssignments([
      { areaId: "3.5", relevance: 3, justification: "" },
      { areaId: "3.5", relevance: 0.2, justification: "" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].relevance).toBeCloseTo(1);
  });
});

describe("Perfil curricular", () => {
  const subjects = [subj("prog", 6), subj("redes", 4), subj("calculo", 5)];
  const cls: SubjectClassification[] = [
    { subjectId: "prog", assignments: [{ areaId: "5.5", relevance: 1, justification: "" }], uncertain: false, note: "" },
    {
      subjectId: "redes",
      assignments: [
        { areaId: "3.5", relevance: 0.5, justification: "" },
        { areaId: "3.9", relevance: 0.5, justification: "" },
      ],
      uncertain: false,
      note: "",
    },
    { subjectId: "calculo", assignments: [], uncertain: false, note: "" },
  ];
  const prof = computeProfile(subjects, cls, chooseWeighting(subjects));

  it("puntaje del área = Σ peso × relevancia", () => {
    expect(prof.rawScores[AREA_IDS.indexOf("5.5")]).toBe(6);
    expect(prof.rawScores[AREA_IDS.indexOf("3.5")]).toBe(2);
    expect(prof.rawScores[AREA_IDS.indexOf("3.9")]).toBe(2);
    expect(prof.classifiedWeight).toBe(10);
  });
  it("el perfil normalizado suma 1 y las categorías también", () => {
    expect(sum(prof.profile)).toBeCloseTo(1);
    expect(sum(prof.categories.map((c) => c.share))).toBeCloseTo(1);
    expect(prof.categories.find((c) => c.category === "SF")!.share).toBeCloseTo(0.6);
    expect(prof.categories.find((c) => c.category === "SAI")!.share).toBeCloseTo(0.4);
  });
  it("las contribuciones son rastreables a las materias", () => {
    const sai = prof.categories.find((c) => c.category === "SAI")!;
    expect(sai.contributions).toHaveLength(1);
    expect(sai.contributions[0].subjectId).toBe("redes");
    expect(sai.contributions[0].share).toBeCloseTo(0.4);
  });
});

describe("Perfiles de referencia y similitud", () => {
  it("usa el punto medio de los rangos de la Tabla 5.3", () => {
    const mid = referenceMidpoints("CE");
    expect(mid[AREA_IDS.indexOf("1.1")]).toBe(3.5);
    expect(mid[AREA_IDS.indexOf("6.4")]).toBe(3.5);
  });
  it("los perfiles de referencia suman 1", () => {
    for (const d of DISCIPLINE_IDS) expect(sum(referenceProfile(d))).toBeCloseTo(1);
  });
  it("un perfil idéntico a una referencia obtiene índice 100 y queda primero", () => {
    for (const d of DISCIPLINE_IDS) {
      const sims = computeSimilarities(referenceProfile(d));
      expect(sims[0].discipline).toBe(d);
      expect(sims[0].index).toBe(100);
    }
  });
  it("un perfil puramente de hardware se parece más a CE", () => {
    const v = AREA_IDS.map((id) => (id.startsWith("6.") ? 1 : 0));
    expect(computeSimilarities(v)[0].discipline).toBe("CE");
  });
});

describe("Proyección bidimensional", () => {
  it("un perfil 100% de una categoría cae en su ancla", () => {
    const shares = { UO: 0, SM: 0, SAI: 0, SD: 0, SF: 0, HW: 1 };
    expect(projectToMap(shares)).toEqual({ x: CATEGORY_ANCHORS.HW.x, y: CATEGORY_ANCHORS.HW.y });
  });
  it("es un promedio ponderado (lineal)", () => {
    const p = projectToMap({ UO: 0.5, SM: 0, SAI: 0, SD: 0, SF: 0, HW: 0.5 });
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(0);
  });
  it("permanece dentro de [-1, 1]² y ubica CE a la izquierda de IS", () => {
    const ce = projectToMap(referenceCategoryShares("CE"));
    const is = projectToMap(referenceCategoryShares("IS"));
    for (const p of [ce, is]) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(1);
    }
    expect(ce.x).toBeLessThan(is.x);
    expect(ce.y).toBeLessThan(is.y);
  });
  it("vector cero → origen", () => {
    expect(projectToMap({ UO: 0, SM: 0, SAI: 0, SD: 0, SF: 0, HW: 0 })).toEqual({ x: 0, y: 0 });
  });
});

describe("Análisis completo", () => {
  it("es determinista y reporta materias no clasificadas", () => {
    const demo = buildDemoAnalysis();
    const a = computeAnalysis(demo.curriculum, demo.classifications);
    const b = computeAnalysis(demo.curriculum, demo.classifications);
    expect(a).toEqual(b);
    expect(a.weighting).toBe("credits");
    expect(sum(a.categories.map((c) => c.share))).toBeCloseTo(1);
    expect(a.unclassifiedSubjects.some((s) => s.name === "Cálculo diferencial")).toBe(true);
    expect(a.classifiedFraction).toBeGreaterThan(0);
    expect(a.classifiedFraction).toBeLessThan(1);
  });
  it("calcula el nivel de respaldo documental", () => {
    const curriculum: Curriculum = {
      careerName: "",
      university: "",
      planYear: "",
      subjects: [subj("a"), subj("b")],
      source: "image",
      documentQuality: "poor",
    };
    const r = computeAnalysis(curriculum, []);
    expect(r.confidence.level).toBe("limitada");
    expect(r.confidence.onlyNames).toBe(true);
  });
});

describe("Comparación", () => {
  it("genera afirmaciones solo con diferencias ≥ 5 puntos", () => {
    const demo = buildDemoAnalysis();
    const r = computeAnalysis(demo.curriculum, demo.classifications);
    expect(compareCareers([{ id: "a", label: "A", result: r }, { id: "b", label: "B", result: r }])[0]).toMatch(/muy parecidas/);
  });
});

describe("Captura manual", () => {
  it("interpreta encabezados de semestre, créditos y descripciones", () => {
    const s = parseManualSubjects("Semestre 1\nProgramación | 5 | variables y ciclos\nCálculo\n2do semestre\n- Redes | 4");
    expect(s).toHaveLength(3);
    expect(s[0]).toMatchObject({ name: "Programación", semester: 1, credits: 5, description: "variables y ciclos" });
    expect(s[1]).toMatchObject({ name: "Cálculo", semester: 1, credits: null });
    expect(s[2]).toMatchObject({ name: "Redes", semester: 2, credits: 4 });
  });
});

