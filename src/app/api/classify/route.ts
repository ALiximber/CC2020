import { NextResponse } from "next/server";
import { sanitizeAssignments } from "@/lib/analysis/sanitize";
import { generateJson } from "@/lib/gemini/generate";
import { CLASSIFICATION_JSON_SCHEMA, CLASSIFICATION_SYSTEM } from "@/lib/gemini/prompts";
import { assertSameOrigin, checkRateLimit, clientIp, errorResponse, readJson } from "@/lib/security/request";
import { ClassificationResponseSchema, ClassifyRequestSchema } from "@/lib/validation/schemas";
import type { SubjectClassification } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Etapa B — Clasificación académica.
 * Gemini relaciona cada materia con áreas del CC2020 (relevancias 0–1 + justificación).
 * NO calcula porcentajes: los cálculos los hace TypeScript en el cliente
 * (src/lib/analysis), de manera determinista.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    checkRateLimit(`classify:${clientIp(req)}`, 40, 10 * 60_000);
    const body = await readJson(req, ClassifyRequestSchema);

    const listing = body.subjects
      .map((s, i) => {
        const meta = [
          s.semester ? `semestre ${s.semester}` : null,
          s.credits ? `${s.credits} créditos` : null,
          s.hours ? `${s.hours} horas` : null,
        ]
          .filter(Boolean)
          .join(", ");
        const desc = s.description ? `\n   Temario/descripción: ${s.description}` : "";
        return `[${i}] ${s.name}${meta ? ` (${meta})` : ""}${desc}`;
      })
      .join("\n");

    const prompt = `Carrera: ${body.careerName || "(no indicada)"}\nClasifica cada una de las siguientes ${body.subjects.length} materias.\n<documento>\n${listing}\n</documento>`;

    const { data, model } = await generateJson({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: CLASSIFICATION_SYSTEM,
      jsonSchema: CLASSIFICATION_JSON_SCHEMA as unknown as Record<string, unknown>,
      zodSchema: ClassificationResponseSchema,
      timeoutMs: 50_000,
      retries: 1,
    });

    const byIndex = new Map(data.classifications.map((c) => [c.subjectIndex, c]));
    const classifications: SubjectClassification[] = body.subjects.map((s, i) => {
      const c = byIndex.get(i);
      if (!c) {
        return { subjectId: s.id, assignments: [], uncertain: true, note: "La IA no devolvió una clasificación para esta materia." };
      }
      return {
        subjectId: s.id,
        assignments: sanitizeAssignments(c.areas),
        uncertain: c.uncertain,
        note: c.note,
      };
    });

    return NextResponse.json({ classifications, model }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}

