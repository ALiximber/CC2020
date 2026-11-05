"use client";

import { LIMITS } from "@/lib/validation/schemas";

/**
 * Optimiza una imagen antes de enviarla a Gemini: la redimensiona (lado mayor
 * ≤ maxDim) y la convierte a JPEG. Reduce el tamaño para respetar los límites
 * de Vercel (~4.5 MB por solicitud) y los tokens del nivel gratuito.
 */
export async function compressImage(
  file: File,
  maxDim = 2000,
  quality = 0.8,
): Promise<{ mimeType: "image/jpeg"; data: string; preview: string }> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("No pudimos leer la imagen. Verifica que sea un archivo JPG o PNG válido.");
  });
  let q = quality;
  let dim = maxDim;
  for (let attempt = 0; attempt < 5; attempt++) {
    const scale = Math.min(1, dim / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas no disponible");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/jpeg", q);
    const data = url.split(",")[1];
    if (data.length <= LIMITS.maxImageBase64Chars) {
      bitmap.close();
      return { mimeType: "image/jpeg", data, preview: url };
    }
    q = Math.max(0.5, q - 0.1);
    dim = Math.round(dim * 0.8);
  }
  bitmap.close();
  throw new Error("La imagen es demasiado grande incluso después de comprimirla.");
}

