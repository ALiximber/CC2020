import { AppError, type ApiErrorBody } from "@/lib/errors";
import { LIMITS } from "@/lib/validation/schemas";
import { NextResponse } from "next/server";
import type { z } from "zod";

/* ------------------------------------------------------------------ */
/* Limitador de solicitudes en memoria (protección básica contra abuso). */
/* En serverless cada instancia tiene su propia memoria, por lo que es  */
/* una protección "de mejor esfuerzo"; la cuota real la impone Gemini.  */
/* ------------------------------------------------------------------ */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  if (buckets.size > 5_000) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  b.count += 1;
  if (b.count > max) throw new AppError("RATE_LIMIT", `Límite local excedido para ${key}`);
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

/** Rechaza solicitudes de otros orígenes (protección básica CSRF/abuso). */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  if (!origin) return; // p. ej. herramientas del servidor; el rate limit sigue aplicando
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (host && new URL(origin).host !== host) throw new AppError("BAD_REQUEST", "Origen no permitido");
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError("BAD_REQUEST", "Origen inválido");
  }
}

/** Lee y valida el cuerpo JSON respetando el límite de tamaño. */
export async function readJson<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > LIMITS.maxRequestBytes) throw new AppError("TOO_LARGE", `content-length ${len}`);
  const raw = await req.text();
  if (raw.length > LIMITS.maxRequestBytes) throw new AppError("TOO_LARGE", `body ${raw.length}`);
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new AppError("BAD_REQUEST", "JSON malformado");
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const tooBig = parsed.error.issues.some((i) => i.code === "too_big");
    throw new AppError(tooBig ? "TOO_LARGE" : "BAD_REQUEST", parsed.error.message.slice(0, 300));
  }
  return parsed.data;
}

export function errorResponse(err: unknown): NextResponse<ApiErrorBody> {
  const appErr = err instanceof AppError ? err : new AppError("UNKNOWN", err instanceof Error ? err.message : String(err));
  if (!(err instanceof AppError)) console.error("[api] error inesperado:", err);
  return NextResponse.json(
    { error: { code: appErr.code, message: appErr.userMessage } },
    { status: appErr.status, headers: { "Cache-Control": "no-store" } },
  );
}

