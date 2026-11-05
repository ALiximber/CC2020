import { DISCIPLINE_IDS } from "@/data/cc2020-reference";
import { REFERENCE_PROFILES } from "@/lib/cc2020/reference-profiles";
import type { SimilarityResult } from "@/types";
import { cosineSimilarity, round } from "./vector";

/**
 * Paso 5: compara el perfil de 34 áreas de la carrera con el perfil de referencia
 * (puntos medios normalizados de la Tabla 5.3) de cada disciplina usando
 * similitud coseno. El índice (0–100) es un cálculo de la plataforma, NO un
 * porcentaje oficial de pertenencia a una disciplina.
 */
export function computeSimilarities(profile: readonly number[]): SimilarityResult[] {
  return DISCIPLINE_IDS.map((discipline) => {
    const cosine = cosineSimilarity(profile, REFERENCE_PROFILES[discipline]);
    return { discipline, cosine, index: round(cosine * 100) };
  }).sort((a, b) => b.cosine - a.cosine);
}

