import { NextResponse } from "next/server";
import { generateJson } from "@/lib/gemini/generate";
import { SUMMARY_JSON_SCHEMA, SUMMARY_SYSTEM } from "@/lib/gemini/prompts";
import { assertSameOrigin, checkRateLimit, clientIp, errorResponse, readJson } from "@/lib/security/request";
import { SummarizeRequestSchema, SummaryResponseSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * Redacción del resumen en lenguaje sencillo a partir de resultados YA CALCULADOS.
 * Si falla, el cliente usa un resumen determinista generado localmente.
 */
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    checkRateLimit(`summarize:${clientIp(req)}`, 15, 10 * 60_000);
    const body = await readJson(req, SummarizeRequestSchema);

    const facts = JSON.stringify(body, null, 1);
    const { data, model } = await generateJson({
      contents: [{ role: "user", parts: [{ text: `Resultados calculados:\n${facts}` }] }],
      systemInstruction: SUMMARY_SYSTEM,
      jsonSchema: SUMMARY_JSON_SCHEMA as unknown as Record<string, unknown>,
      zodSchema: SummaryResponseSchema,
      timeoutMs: 20_000,
      retries: 0,
      totalBudgetMs: 25_000,
      maxOutputTokens: 4_096,
    });

    return NextResponse.json({ summary: data.summary, model }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}

