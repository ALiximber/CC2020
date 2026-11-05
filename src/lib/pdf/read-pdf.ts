"use client";

import { LIMITS } from "@/lib/validation/schemas";

/**
 * Lectura de PDF en el navegador con PDF.js.
 * - Si el PDF tiene texto digital, se extrae el texto (no se envía el archivo).
 * - Si es un escaneo (casi sin texto), se renderizan algunas páginas como
 *   imágenes JPEG comprimidas para que Gemini las lea de forma multimodal.
 */

type PdfJs = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfJs> | null = null;

async function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return mod;
    });
  }
  return pdfjsPromise;
}

export interface PdfReadResult {
  text: string;
  pageCount: number;
  /** true si el texto es insuficiente y conviene usar las imágenes. */
  isScanned: boolean;
  images: { mimeType: "image/jpeg"; data: string }[];
  /** Miniatura de la primera página (data URL) para la vista previa. */
  preview: string | null;
  truncated: boolean;
}

export class PdfReadError extends Error {
  constructor(
    public readonly kind: "encrypted" | "malformed" | "too-many-pages",
    message: string,
  ) {
    super(message);
  }
}

async function renderPageToJpeg(page: import("pdfjs-dist").PDFPageProxy, maxDim: number, quality: number): Promise<string> {
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(2.5, maxDim / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  canvas.width = 0;
  canvas.height = 0;
  return dataUrl;
}

export async function readPdf(file: File): Promise<PdfReadResult> {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  let doc: import("pdfjs-dist").PDFDocumentProxy;
  try {
    doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
  } catch (e) {
    const name = (e as { name?: string })?.name;
    if (name === "PasswordException") throw new PdfReadError("encrypted", "El PDF está protegido con contraseña.");
    throw new PdfReadError("malformed", "El archivo PDF está dañado o no se puede leer.");
  }

  try {
    const pageCount = doc.numPages;
    const pagesToRead = Math.min(pageCount, LIMITS.maxPdfPages);
    const texts: string[] = [];
    for (let p = 1; p <= pagesToRead; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      let pageText = "";
      for (const item of content.items) {
        if ("str" in item) {
          pageText += item.str;
          pageText += item.hasEOL ? "\n" : " ";
        }
      }
      texts.push(`--- Página ${p} ---\n${pageText.replace(/[ \t]+/g, " ").trim()}`);
    }
    let text = texts.join("\n\n");
    let truncated = pageCount > pagesToRead;
    if (text.length > LIMITS.maxTextChars) {
      text = text.slice(0, LIMITS.maxTextChars);
      truncated = true;
    }
    const meaningfulChars = text.replace(/--- Página \d+ ---/g, "").replace(/\s+/g, "").length;
    const isScanned = meaningfulChars < 80 * Math.min(pagesToRead, 3);

    const firstPage = await doc.getPage(1);
    const preview = await renderPageToJpeg(firstPage, 700, 0.7);

    const images: PdfReadResult["images"] = [];
    if (isScanned) {
      const n = Math.min(pageCount, LIMITS.maxScanPages);
      for (let p = 1; p <= n; p++) {
        const page = await doc.getPage(p);
        const url = await renderPageToJpeg(page, 1600, 0.72);
        images.push({ mimeType: "image/jpeg", data: url.split(",")[1] });
      }
      truncated = truncated || pageCount > n;
    }
    return { text, pageCount, isScanned, images, preview, truncated };
  } finally {
    await doc.destroy();
  }
}

