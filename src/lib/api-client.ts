"use client";

import type { AppErrorCode } from "@/lib/errors";
import { USER_MESSAGES } from "@/lib/errors";
import { LIMITS, type ExtractRequest } from "@/lib/validation/schemas";
import type { DocumentQuality, Subject, SubjectClassification } from "@/types";

export class ClientApiError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
  ) {
    super(message);
  }
}

async function postJson<T>(url: string, body: unknown, timeoutMs: number, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);
  let res: Response;
  try {
    const payload = JSON.stringify(body);
    if (payload.length > LIMITS.maxRequestBytes) throw new ClientApiError("TOO_LARGE", USER_MESSAGES.TOO_LARGE);
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof ClientApiError) throw e;
    if (signal?.aborted) throw new ClientApiError("UNKNOWN", "Operación cancelada.");
    if (controller.signal.aborted) throw new ClientApiError("TIMEOUT", USER_MESSAGES.TIMEOUT);
    throw new ClientApiError("NETWORK", USER_MESSAGES.NETWORK);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // Respuestas no JSON (p. ej. 413 o 504 de la plataforma de hospedaje).
  }
  if (!res.ok) {
    const err = (json as { error?: { code?: AppErrorCode; message?: string } } | null)?.error;
    const code: AppErrorCode = err?.code ?? (res.status === 413 ? "TOO_LARGE" : res.status === 504 ? "TIMEOUT" : res.status === 429 ? "QUOTA" : "UNKNOWN");
    throw new ClientApiError(code, err?.message ?? USER_MESSAGES[code]);
  }
  return json as T;
}

export interface ExtractResponse {
  careerName: string;
  university: string;
  planYear: string;
  documentQuality: DocumentQuality;
  subjects: { name: string; semester: number | null; credits: number | null; hours: number | null; description: string }[];
  model: string;
}

export function extractCurriculum(req: ExtractRequest, signal?: AbortSignal) {
  return postJson<ExtractResponse>("/api/extract", req, 70_000, signal);
}

/**
 * Clasifica todas las materias dividiéndolas en lotes pequeños (una llamada por
 * lote) para respetar los límites de tiempo de Vercel y de tokens de Gemini.
 */
export async function classifySubjects(
  careerName: string,
  subjects: Subject[],
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<{ classifications: SubjectClassification[]; model: string }> {
  const size = LIMITS.classifyBatchSize;
  const all: SubjectClassification[] = [];
  let model = "";
  for (let i = 0; i < subjects.length; i += size) {
    const batch = subjects.slice(i, i + size);
    const res = await postJson<{ classifications: SubjectClassification[]; model: string }>(
      "/api/classify",
      { careerName, subjects: batch },
      70_000,
      signal,
    );
    all.push(...res.classifications);
    model = res.model;
    onProgress?.(Math.min(i + size, subjects.length), subjects.length);
  }
  return { classifications: all, model };
}

export function summarize(body: unknown, signal?: AbortSignal) {
  return postJson<{ summary: string; model: string }>("/api/summarize", body, 35_000, signal);
}

export async function fetchStatus(): Promise<{ aiConfigured: boolean; model: string } | null> {
  try {
    const res = await fetch("/api/status", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as { aiConfigured: boolean; model: string };
  } catch {
    return null;
  }
}

