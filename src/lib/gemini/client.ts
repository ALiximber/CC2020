import { ApiError, GoogleGenAI } from "@google/genai";
import { AppError } from "@/lib/errors";

/**
 * Cliente de Gemini — SOLO SERVIDOR.
 * La clave se lee de process.env y nunca se envía al navegador
 * (no usa el prefijo NEXT_PUBLIC_).
 */
if (typeof window !== "undefined") {
  throw new Error("El cliente de Gemini solo puede usarse en el servidor.");
}

export const DEFAULT_MODEL = "gemini-3.8-flash";
export const DEFAULT_FALLBACK_MODEL = "gemini-flash-latest";

let cached: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new AppError("MISSING_API_KEY", "GEMINI_API_KEY no está definida");
  if (!cached) cached = new GoogleGenAI({ apiKey });
  return cached;
}

export function getModelNames(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim() || DEFAULT_FALLBACK_MODEL;
  return primary === fallback ? [primary] : [primary, fallback];
}

/** Traduce cualquier error del SDK a un AppError con mensaje amigable. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof ApiError) {
    const msg = err.message ?? "";
    switch (err.status) {
      case 400:

        if (/api key|API_KEY/i.test(msg)) return new AppError("AUTH", msg);
        if (/too large|exceeds|token/i.test(msg)) return new AppError("TOO_LARGE", msg);
        return new AppError("BAD_REQUEST", msg);

    
      case 401:
      case 403:
        return new AppError("AUTH", msg);
      case 404:
        return new AppError("MODEL_UNAVAILABLE", msg);
      case 408:
      case 504:
        return new AppError("TIMEOUT", msg, true);
      case 413:
        return new AppError("TOO_LARGE", msg);
      case 429:
        return new AppError("QUOTA", msg, true);
      case 500:
      case 502:
      case 503:
        return new AppError("MODEL_UNAVAILABLE", msg, true);
      default:
        return new AppError("UNKNOWN", msg);
    }
  }
  if (err instanceof Error) {
    if (err.name === "AbortError" || /abort|timeout|timed out/i.test(err.message)) {
      return new AppError("TIMEOUT", err.message, true);
    }
    if (/fetch failed|ECONNRESET|ENOTFOUND|ETIMEDOUT|network|socket/i.test(err.message)) {
      return new AppError("NETWORK", err.message, true);
    }
    return new AppError("UNKNOWN", err.message);
  }
  return new AppError("UNKNOWN", String(err));
}
