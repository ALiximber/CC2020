import type { CategoryId } from "@/data/cc2020-areas";
import type { MapPoint } from "@/types";

/**
 * PROYECCIÓN BIDIMENSIONAL PROPIA DE LA PLATAFORMA
 * ------------------------------------------------
 * La Figura 2.2 del CC2020 organiza la computación en dos ejes conceptuales:
 *  - Horizontal: Hardware → Software → Necesidades organizacionales.
 *  - Vertical:   Fundamentos de computación → Tecnología → Actividad del dominio
 *                (aplicaciones en organizaciones).
 * El CC2020 NO proporciona una fórmula para ubicar carreras nuevas en esa figura.
 * Por ello definimos un método propio, transparente y reproducible:
 *
 * A cada una de las 6 categorías se le asigna una coordenada "ancla" en [-1, 1]²
 * según su posición conceptual en la figura. La posición de un perfil es el
 * promedio de las anclas ponderado por la proporción de cada categoría:
 *
 *     x = Σ_c  p_c · ancla_c.x        y = Σ_c  p_c · ancla_c.y
 *
 * La misma transformación se aplica a las 6 disciplinas oficiales y a las carreras
 * analizadas. No se ajusta ninguna coordenada manualmente.
 */
export const CATEGORY_ANCHORS: Readonly<Record<CategoryId, MapPoint & { reason: string }>> = {
  HW: { x: -1, y: -1, reason: "Hardware (eje horizontal) y fundamentos (eje vertical)." },
  SF: { x: 0, y: -1, reason: "Software (eje horizontal) y fundamentos (eje vertical)." },
  SAI: { x: -0.5, y: 0, reason: "Integra hardware y software en plataformas tecnológicas (nivel tecnología)." },
  SD: { x: 0, y: 0, reason: "Software (eje horizontal) en el nivel de tecnología." },
  SM: { x: 0.5, y: 0.5, reason: "Entre software y organizaciones; entre tecnología y dominio de aplicación." },
  UO: { x: 1, y: 1, reason: "Necesidades organizacionales y actividad del dominio." },
};

/** Proyecta proporciones por categoría (que suman 1) a coordenadas (x, y). */
export function projectToMap(categoryShares: Readonly<Record<CategoryId, number>>): MapPoint {
  let total = 0;
  let x = 0;
  let y = 0;
  for (const [cat, anchor] of Object.entries(CATEGORY_ANCHORS) as [CategoryId, MapPoint][]) {
    const p = categoryShares[cat] ?? 0;
    total += p;
    x += p * anchor.x;
    y += p * anchor.y;
  }
  if (!(total > 0)) return { x: 0, y: 0 };
  return { x: x / total, y: y / total };
}

