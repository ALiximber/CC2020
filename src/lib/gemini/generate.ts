import type { ContentListUnion } from "@google/genai";
import type { z } from "zod";
import { AppError } from "@/lib/errors";
import { getGeminiClient, getModelNames, toAppError } from "./client";

export interface GenerateJsonOptions<T extends z.ZodTypeAny> {
  contents: ContentListUnion;
  systemInstruction: string;
  jsonSchema: Record<string, unknown>;
  zodSchema: T;
  timeoutMs?: number;
  maxOutputTokens?: number;
  /** Número de reintentos ante errores transitorios (429/503/timeout). */
  retries?: number;
  /** Tiempo total máximo (todos los intentos y modelos). */
  totalBudgetMs?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Extrae JSON aunque el modelo lo envuelva en ```json ... ```. */
export function parseJsonLoose(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Llama a Gemini pidiendo una respuesta JSON estructurada y la valida con Zod.
 * - Tiempo de espera por intento.
 * - Reintentos controlados con espera exponencial para errores transitorios.
 * - Si el modelo principal no existe (404) o está saturado, prueba el de respaldo.
 */
export async function generateJson<T extends z.ZodTypeAny>(
  opts: GenerateJsonOptions<T>,
): Promise<{ data: z.infer<T>; model: string }> {
  const ai = getGeminiClient();
  const models = getModelNames();
  const retries = opts.retries ?? 1;
  const timeoutMs = opts.timeoutMs ?? 45_000;
  // Presupuesto total para respetar el límite de duración de las funciones de Vercel.
  const deadline = Date.now() + (opts.totalBudgetMs ?? 55_000);
  let lastError: AppError = new AppError("UNKNOWN");

  for (const model of models) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < 5_000) throw lastError.code === "UNKNOWN" ? new AppError("TIMEOUT", "Sin tiempo restante") : lastError;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.min(timeoutMs, remaining));
      try {
        const response = await ai.models.generateContent({
          model,
          contents: opts.contents,
          config: {
            systemInstruction: opts.systemInstruction,
            responseMimeType: "application/json",
            responseJsonSchema: opts.jsonSchema,
            temperature: 0.1,
            maxOutputTokens: opts.maxOutputTokens ?? 16_384,
            abortSignal: controller.signal,
          },
        });
        const text = response.text;
        if (!text) throw new AppError("INVALID_AI_RESPONSE", "Respuesta vacía de Gemini");
        let json: unknown;
        try {
          json = parseJsonLoose(text);
        } catch {
          throw new AppError("INVALID_AI_RESPONSE", "JSON inválido", true);
        }
        const parsed = opts.zodSchema.safeParse(json);
        if (!parsed.success) {
          throw new AppError("INVALID_AI_RESPONSE", `Validación Zod: ${parsed.error.message.slice(0, 500)}`, true);
        }
        return { data: parsed.data, model };
      } catch (err) {
        lastError = controller.signal.aborted ? new AppError("TIMEOUT", "Tiempo agotado", true) : toAppError(err);
        console.error(`[gemini] modelo=${model} intento=${attempt + 1} código=${lastError.code}: ${lastError.message}`);
        if (lastError.code === "AUTH" || lastError.code === "MISSING_API_KEY" || lastError.code === "TOO_LARGE" || lastError.code === "BAD_REQUEST") {
          throw lastError;
        }
        // Modelo inexistente: pasar directamente al de respaldo.
        if (lastError.code === "MODEL_UNAVAILABLE" && !lastError.retryable) break;
        if (!lastError.retryable || attempt === retries) break;
        await sleep(lastError.code === "QUOTA" ? 4_000 : 1_500 * (attempt + 1));
      } finally {
        clearTimeout(timer);
      }
    }
    // Ante cuota diaria agotada no tiene sentido seguir probando de inmediato con otro modelo,
    // pero el modelo de respaldo puede tener su propia cuota, así que se intenta una vez.
  }
  throw lastError;
}
