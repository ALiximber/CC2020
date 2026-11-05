import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";
import { generateJson } from "@/lib/gemini/generate";
import { EXTRACTION_JSON_SCHEMA, EXTRACTION_SYSTEM } from "@/lib/gemini/prompts";
import { assertSameOrigin, checkRateLimit, clientIp, errorResponse, readJson } from "@/lib/security/request";
import { ExtractionResponseSchema, ExtractRequestSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Etapa A — Extracción de información del plan de estudios.
 * Recibe texto (extraído con PDF.js en el navegador) o imágenes optimizadas
 * (fotos/escaneos) y devuelve las materias detectadas por Gemini.
 * El documento NO se almacena.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    checkRateLimit(`extract:${clientIp(req)}`, 10, 10 * 60_000);
    const body = await readJson(req, ExtractRequestSchema);

    const contents =
      body.mode === "text"
        ? [{ role: "user", parts: [{ text: `Extrae la información del siguiente plan de estudios.\n<documento>\n${body.text}\n</documento>` }] }]
        : [
            {
              role: "user",
              parts: [
                { text: "Extrae la información del plan de estudios que aparece en las siguientes imágenes (páginas en orden)." },
                ...body.images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
              ],
            },
          ];

    const { data, model } = await generateJson({
      contents,
      systemInstruction: EXTRACTION_SYSTEM,
      jsonSchema: EXTRACTION_JSON_SCHEMA as unknown as Record<string, unknown>,
      zodSchema: ExtractionResponseSchema,
      timeoutMs: 50_000,
      retries: 1,
      maxOutputTokens: 32_768,
    });

    if (!data.isCurriculum && data.subjects.length < 3) throw new AppError("NOT_CURRICULUM");
    // Elimina duplicados exactos (misma materia y semestre).
    const seen = new Set<string>();
    const subjects = data.subjects.filter((s) => {
      const key = `${s.name.toLowerCase()}|${s.semester ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (subjects.length === 0) throw new AppError("NO_SUBJECTS");

    return NextResponse.json(
      {
        careerName: data.careerName,
        university: data.university,
        planYear: data.planYear,
        documentQuality: data.documentQuality,
        subjects,
        model,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return errorResponse(err);
  }
}

