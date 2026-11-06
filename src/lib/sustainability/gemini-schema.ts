import { z } from "zod";

/** Esquema de generación reducido; Zod sigue aplicando TODOS los límites al recibir. */
export function geminiSchema(schema: z.ZodType): Record<string, unknown> {
  function simplify(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(simplify);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value).filter(([key]) => !["$schema", "additionalProperties", "minLength", "maxLength", "minItems", "maxItems"].includes(key)).map(([key, val]) => [key, simplify(val)]));
  }
  return simplify(z.toJSONSchema(schema)) as Record<string, unknown>;
}
