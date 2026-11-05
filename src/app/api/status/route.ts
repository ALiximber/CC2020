import { NextResponse } from "next/server";
import { getModelNames } from "@/lib/gemini/client";

export const dynamic = "force-dynamic";

/** Indica si el análisis con IA está configurado (sin revelar la clave). */
export async function GET() {
  return NextResponse.json(
    { aiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()), model: getModelNames()[0] },
    { headers: { "Cache-Control": "no-store" } },
  );
}

