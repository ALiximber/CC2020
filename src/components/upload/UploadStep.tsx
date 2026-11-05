"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileImage,
  FileText,
  Keyboard,
  Loader2,
  FolderOpen,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { MANUAL_EXAMPLE } from "@/data/demo-curriculum";
import { parseManualSubjects } from "@/lib/analysis/manual-parse";
import { compressImage } from "@/lib/pdf/image";
import { PdfReadError, readPdf, type PdfReadResult } from "@/lib/pdf/read-pdf";
import { LIMITS, type ExtractRequest } from "@/lib/validation/schemas";
import type { Curriculum } from "@/types";

interface UploadStepProps {
  onExtractWithAi: (
    request: ExtractRequest,
  ) => void;
  onManualReady: (curriculum: Curriculum) => void;
  onTryDemo: () => void;
  errorMessage?: string | null;
}

type InputTab = "file" | "manual";

interface PreparedFile {
  name: string;
  sizeBytes: number;
  kind: "pdf" | "image";
  previewUrl: string | null;
  pdfResult?: PdfReadResult;
  imagePayload?: { mimeType: "image/jpeg"; data: string };
}

export function UploadStep({
  onExtractWithAi,
  onManualReady,
  onTryDemo,
  errorMessage,
}: UploadStepProps) {
  const [tab, setTab] = useState<InputTab>("file");
  const [manualText, setManualText] = useState("");
  const [prepared, setPrepared] = useState<PreparedFile | null>(null);
  const [readingFile, setReadingFile] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);


  async function handleFileSelected(file: File | undefined) {
    if (!file || readingFile) return;
    setLocalError(null);

    if (file.size > LIMITS.maxFileBytes) {
      setLocalError(
        "El archivo supera el límite de 15 MB. Prueba subiendo únicamente las páginas de la retícula o una captura de pantalla.",
      );
      return;
    }

    const lower = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf");
    const isImage =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png");

    if (!isPdf && !isImage) {
      setLocalError("Formato no compatible. Sube un archivo PDF, JPG o PNG.");
      return;
    }

    setReadingFile(true);
    try {
      let document: PreparedFile;
      if (isPdf) {
        const pdfResult = await readPdf(file);
        document = {
          name: file.name,
          sizeBytes: file.size,
          kind: "pdf",
          previewUrl: pdfResult.preview,
          pdfResult,
        };
      } else {
        const img = await compressImage(file);
        document = {
          name: file.name,
          sizeBytes: file.size,
          kind: "image",
          previewUrl: img.preview,
          imagePayload: { mimeType: img.mimeType, data: img.data },
        };
      }
      setPrepared(document);
      handleContinueFromFile(document);
    } catch (err) {
      if (err instanceof PdfReadError) {
        setLocalError(err.message);
      } else if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError("No pudimos leer este archivo. Intenta con otro documento o imagen.");
      }
      setPrepared(null);
    } finally {
      setReadingFile(false);
    }
  }

  function handleContinueFromFile(prepared: PreparedFile) {
    setLocalError(null);


    if (prepared.kind === "pdf" && prepared.pdfResult) {
      if (prepared.pdfResult.isScanned) {
        onExtractWithAi(
          {
            mode: "images",
            images: prepared.pdfResult.images,
            source: "pdf-scan",
          },
        );
      } else {
        onExtractWithAi(
          {
            mode: "text",
            text: prepared.pdfResult.text,
            source: "pdf-text",
          },
        );
      }
      return;
    }

    if (prepared.kind === "image" && prepared.imagePayload) {
      onExtractWithAi(
        {
          mode: "images",
          images: [prepared.imagePayload],
          source: "image",
        },
      );
    }
  }

  function handleContinueFromManual() {
    setLocalError(null);
    const subjects = parseManualSubjects(manualText);
    if (subjects.length < 2) {
      setLocalError("Escribe al menos 2 materias (una por línea) para continuar.");
      return;
    }
    onManualReady({
      careerName: "Mi carrera",
      university: "",
      planYear: "",
      subjects,
      source: "manual",
      documentQuality: "good",
    });
  }

  const activeError = localError || errorMessage;

  return (
    <div className="upload-screen">
      <div>
        {tab === "manual" && <button className="quiet-action" onClick={() => setTab("file")}><ArrowLeft size={16}/>Volver a la carga</button>}
        <h1 className="upload-title">{tab === "file" ? "Sube tu retícula" : "Introduce tus materias"}</h1>
        {activeError && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-tint p-4 text-sm text-danger"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-danger mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Atención</p>
              <p className="mt-0.5 text-danger">{activeError}</p>
            </div>
          </div>
        )}

        {tab === "file" ? (
          <div className="mt-6">
            {!prepared ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  handleFileSelected(e.dataTransfer.files?.[0]);
                }}
                className={`drop-zone ${dragActive ? "drag-active" : ""}`}
              >
                <input
                  aria-label="Seleccionar documento PDF, JPG o PNG"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="file-picker" disabled={readingFile}
                  onChange={(e) => { handleFileSelected(e.target.files?.[0]); e.target.value = ""; }}
                />
                {readingFile ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-accent" aria-hidden="true" />
                    <p className="mt-3 text-base font-semibold text-ink">
                      Preparando vista previa del documento...
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Esto ocurre directamente en tu navegador.
                    </p>
                  </>
                ) : (
                  <>
                    <span className="upload-symbol"><UploadCloud size={36} strokeWidth={1.5}/></span>
                    <p className="drop-title">Arrastra y suelta tu documento aquí</p>
                    <p className="formats">PDF, JPG o PNG · Hasta 15 MB</p>
                    <span className="primary-action" aria-hidden="true"><FolderOpen size={18}/>Seleccionar documento</span>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-canvas p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  {prepared.previewUrl && (
                    <div className="mx-auto sm:mx-0 shrink-0 overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prepared.previewUrl}
                        alt={`Vista previa de ${prepared.name}`}
                        className="h-48 w-40 object-contain bg-surface"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {prepared.kind === "pdf" ? (
                          <FileText className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                        ) : (
                          <FileImage className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                        )}
                        <p className="truncate font-semibold text-ink">{prepared.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPrepared(null)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-danger hover:bg-tint"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Cambiar archivo
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-muted">
                      Tamaño: {(prepared.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                      {prepared.pdfResult ? ` · ${prepared.pdfResult.pageCount} página(s)` : ""}
                    </p>

                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-tint border border-line p-3 text-xs text-success">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
                      <div>
                        {prepared.kind === "pdf" && prepared.pdfResult ? (
                          prepared.pdfResult.isScanned ? (
                            <p>
                              <strong>PDF escaneado detectado:</strong> convertimos las páginas en imágenes para que la inteligencia artificial pueda leer la retícula visualmente.
                            </p>
                          ) : (
                            <p>
                              <strong>PDF con texto digital:</strong> extrajimos el texto con PDF.js para identificar las materias rápidamente.
                            </p>
                          )
                        ) : (
                          <p>
                            <strong>Imagen optimizada:</strong> lista para que la inteligencia artificial identifique las materias.
                          </p>
                        )}
                        {prepared.pdfResult?.truncated && (
                          <p className="mt-1 text-warning">
                            Nota: el documento es muy extenso, por lo que se analizarán las primeras páginas donde suele ubicarse el mapa curricular.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleContinueFromFile(prepared)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-action focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                      >
                        Volver a identificar materias
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label htmlFor="manualSubjects" className="block text-sm font-semibold text-ink">
                Lista de materias (una por línea)
              </label>
              <button
                type="button"
                onClick={() => setManualText(MANUAL_EXAMPLE)}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Insertar formato de ejemplo
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              Puedes escribir encabezados como <code className="rounded bg-raised px-1">Semestre 1</code> y opcionalmente agregar créditos y temario separados por <code className="rounded bg-raised px-1">|</code>: <code className="rounded bg-raised px-1">Nombre de la materia | Créditos | Temas principales</code>.
            </p>
            <textarea
              id="manualSubjects"
              rows={9}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={"Semestre 1\nFundamentos de programación | 5 | Variables, ciclos y funciones\nMatemáticas discretas | 5\nBases de datos | 5"}
              className="mt-2 w-full rounded-xl border border-line p-3.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 font-mono"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleContinueFromManual}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-action"
              >
                Revisar materias capturadas
              </button>
            </div>
          </div>
        )}
        {tab === "file" && <button className="manual-action" onClick={() => { setTab("manual"); setLocalError(null); }}><Keyboard size={18}/>Introducir materias manualmente</button>}
        {tab === "manual" && <button className="quiet-action mt-5" onClick={onTryDemo}>Explorar carrera de demostración</button>}
      </div>
    </div>
  );
}

