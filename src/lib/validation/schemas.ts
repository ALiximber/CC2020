import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Límites de procesamiento (compatibles con Vercel y el nivel gratuito) */
/* ------------------------------------------------------------------ */
export const LIMITS = {
  /** Vercel limita el cuerpo de las solicitudes a ~4.5 MB. */
  maxRequestBytes: 4_200_000,
  maxTextChars: 120_000,
  maxImages: 6,
  maxImageBase64Chars: 1_600_000,
  maxSubjects: 150,
  /** Materias por llamada de clasificación (el cliente divide en lotes). */
  classifyBatchSize: 20,
  maxFileBytes: 15 * 1024 * 1024,
  maxPdfPages: 40,
  maxScanPages: 6,
} as const;

const trimmed = (max: number) => z.string().trim().max(max);
const nullableNumber = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
    return Number.isFinite(n) && n > 0 && n < 1000 ? n : null;
  });
const nullableInt = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : parseInt(String(v), 10);
    return Number.isInteger(n) && n > 0 && n <= 20 ? n : null;
  });
const nullableString = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => (v ?? "").trim().slice(0, max));

/* ------------------------- Solicitudes del cliente ------------------------- */

export const ExtractRequestSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("text"),
    text: z.string().min(20, "El documento no contiene suficiente texto.").max(LIMITS.maxTextChars),
    source: z.enum(["pdf-text", "manual"]).default("pdf-text"),
  }),
  z.object({
    mode: z.literal("images"),
    images: z
      .array(
        z.object({
          mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
          data: z.string().min(100).max(LIMITS.maxImageBase64Chars).regex(/^[A-Za-z0-9+/=]+$/),
        }),
      )
      .min(1)
      .max(LIMITS.maxImages),
    source: z.enum(["pdf-scan", "image"]).default("image"),
  }),
]);
export type ExtractRequest = z.infer<typeof ExtractRequestSchema>;

export const SubjectInputSchema = z.object({
  id: z.string().min(1).max(64),
  name: trimmed(200).min(1),
  semester: z.number().int().positive().max(20).nullable(),
  credits: z.number().positive().max(999).nullable(),
  hours: z.number().positive().max(999).nullable(),
  description: trimmed(2500).default(""),
});

export const ClassifyRequestSchema = z.object({
  careerName: trimmed(200).optional().default(""),
  subjects: z.array(SubjectInputSchema).min(1).max(LIMITS.classifyBatchSize),
});
export type ClassifyRequest = z.infer<typeof ClassifyRequestSchema>;

export const SummarizeRequestSchema = z.object({
  careerName: trimmed(200).optional().default(""),
  categories: z
    .array(
      z.object({
        name: trimmed(80),
        percent: z.number().min(0).max(100),
        topSubjects: z.array(trimmed(200)).max(5),
      }),
    )
    .min(1)
    .max(6),
  topSimilarities: z
    .array(z.object({ name: trimmed(80), index: z.number().min(0).max(100) }))
    .max(6),
  nonComputingPercent: z.number().min(0).max(100),
  confidence: z.enum(["suficiente", "parcial", "limitada"]),
});
export type SummarizeRequest = z.infer<typeof SummarizeRequestSchema>;

/* ------------------------- Respuestas de Gemini ------------------------- */

export const ExtractionResponseSchema = z.object({
  isCurriculum: z.boolean().default(true),
  careerName: nullableString(200),
  university: nullableString(200),
  planYear: nullableString(40),
  documentQuality: z.enum(["good", "fair", "poor"]).catch("fair"),
  subjects: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        semester: nullableInt,
        credits: nullableNumber,
        hours: nullableNumber,
        description: nullableString(2500),
      }),
    )
    .max(LIMITS.maxSubjects),
});
export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;

export const ClassificationResponseSchema = z.object({
  classifications: z.array(
    z.object({
      subjectIndex: z.number().int().min(0),
      areas: z
        .array(
          z.object({
            // Las áreas desconocidas y las relevancias fuera de [0,1] se depuran
            // después con sanitizeAssignments() en lugar de rechazar todo el lote.
            areaId: z.string().trim().max(10),
            relevance: z.number().finite(),
            justification: z.string().trim().max(400).default(""),
          }),
        )
        .max(6),
      uncertain: z.boolean().default(false),
      note: z.string().trim().max(300).default(""),
    }),
  ),
});
export type ClassificationResponse = z.infer<typeof ClassificationResponseSchema>;

export const SummaryResponseSchema = z.object({
  summary: z.string().trim().min(20).max(1500),
});
