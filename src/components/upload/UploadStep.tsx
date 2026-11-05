"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileImage,
  FileText,
  Keyboard,
  Loader2,
  Sparkles,
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
    metaOverrides: { careerName: string; university: string; planYear: string },
  ) => void;
  onManualReady: (curriculum: Curriculum) => void;
  onTryDemo: () => void;
  onBack: () => void;
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
  onBack,
  errorMessage,
}: UploadStepProps) {
  const [tab, setTab] = useState<InputTab>("file");
  const [careerName, setCareerName] = useState("");
  const [university, setUniversity] = useState("");
  const [planYear, setPlanYear] = useState("");
  const [manualText, setManualText] = useState("");
  const [prepared, setPrepared] = useState<PreparedFile | null>(null);
  const [readingFile, setReadingFile] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;
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
      if (isPdf) {
        const pdfResult = await readPdf(file);
        setPrepared({
          name: file.name,
          sizeBytes: file.size,
          kind: "pdf",
          previewUrl: pdfResult.preview,
          pdfResult,
        });
      } else {
        const img = await compressImage(file);
        setPrepared({
          name: file.name,
          sizeBytes: file.size,
          kind: "image",
          previewUrl: img.preview,
          imagePayload: { mimeType: img.mimeType, data: img.data },
        });
      }
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

  function handleContinueFromFile() {
    if (!prepared) return;
    setLocalError(null);
    const overrides = {
      careerName: careerName.trim(),
      university: university.trim(),
      planYear: planYear.trim(),
    };

    if (prepared.kind === "pdf" && prepared.pdfResult) {
      if (prepared.pdfResult.isScanned) {
        onExtractWithAi(
          {
            mode: "images",
            images: prepared.pdfResult.images,
            source: "pdf-scan",
          },
          overrides,
        );
      } else {
        onExtractWithAi(
          {
            mode: "text",
            text: prepared.pdfResult.text,
            source: "pdf-text",
          },
          overrides,
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
        overrides,
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
      careerName: careerName.trim() || "Mi carrera",
      university: university.trim(),
      planYear: planYear.trim(),
      subjects,
      source: "manual",
      documentQuality: "good",
    });
  }

  const activeError = localError || errorMessage;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al inicio
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Paso 1 de 4
            </span>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Sube el plan de estudios de la carrera
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Sube la retícula en PDF o imagen (JPG/PNG), o escribe la lista de materias manualmente.
            </p>
          </div>
          <button
            type="button"
            onClick={onTryDemo}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            Probar con carrera de demostración
          </button>
        </div>

        {/* Selector de modo */}
        <div
          role="tablist"
          aria-label="Método para ingresar el plan de estudios"
          className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "file"}
            onClick={() => {
              setTab("file");
              setLocalError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              tab === "file"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            Subir archivo (PDF, JPG, PNG)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "manual"}
            onClick={() => {
              setTab("manual");
              setLocalError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              tab === "manual"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Keyboard className="h-4 w-4" aria-hidden="true" />
            Escribir materias manualmente
          </button>
        </div>

        {activeError && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Atención</p>
              <p className="mt-0.5 text-red-800">{activeError}</p>
            </div>
          </div>
        )}

        {/* Campos opcionales */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="careerName" className="block text-xs font-semibold text-slate-700">
              Nombre de la carrera <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="careerName"
              type="text"
              value={careerName}
              onChange={(e) => setCareerName(e.target.value)}
              placeholder="Ej. Ingeniería en Computación"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
          <div>
            <label htmlFor="university" className="block text-xs font-semibold text-slate-700">
              Universidad <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="university"
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Ej. UNAM, IPN, TecNM..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
          <div>
            <label htmlFor="planYear" className="block text-xs font-semibold text-slate-700">
              Año del plan <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="planYear"
              type="text"
              value={planYear}
              onChange={(e) => setPlanYear(e.target.value)}
              placeholder="Ej. 2024"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

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
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Arrastra y suelta tu retícula en PDF, JPG o PNG, o haz clic para seleccionar un archivo"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${
                  dragActive
                    ? "border-blue-600 bg-blue-50/70"
                    : "border-slate-300 bg-slate-50/60 hover:border-blue-500 hover:bg-blue-50/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleFileSelected(e.target.files?.[0])}
                />
                {readingFile ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
                    <p className="mt-3 text-base font-semibold text-slate-900">
                      Preparando vista previa del documento...
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Esto ocurre directamente en tu navegador.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                      <UploadCloud className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-900">
                      Arrastra tu retícula aquí o <span className="text-blue-700 underline">selecciona un archivo</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Formatos aceptados: PDF, JPG o PNG (máximo 15 MB).
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  {prepared.previewUrl && (
                    <div className="mx-auto sm:mx-0 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prepared.previewUrl}
                        alt={`Vista previa de ${prepared.name}`}
                        className="h-48 w-40 object-contain bg-white"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {prepared.kind === "pdf" ? (
                          <FileText className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                        ) : (
                          <FileImage className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                        )}
                        <p className="truncate font-semibold text-slate-900">{prepared.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPrepared(null)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Cambiar archivo
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Tamaño: {(prepared.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                      {prepared.pdfResult ? ` · ${prepared.pdfResult.pageCount} página(s)` : ""}
                    </p>

                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
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
                          <p className="mt-1 text-amber-800">
                            Nota: el documento es muy extenso, por lo que se analizarán las primeras páginas donde suele ubicarse el mapa curricular.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleContinueFromFile}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        Identificar materias del documento
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
              <label htmlFor="manualSubjects" className="block text-sm font-semibold text-slate-800">
                Lista de materias (una por línea)
              </label>
              <button
                type="button"
                onClick={() => setManualText(MANUAL_EXAMPLE)}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Insertar formato de ejemplo
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Puedes escribir encabezados como <code className="rounded bg-slate-100 px-1">Semestre 1</code> y opcionalmente agregar créditos y temario separados por <code className="rounded bg-slate-100 px-1">|</code>: <code className="rounded bg-slate-100 px-1">Nombre de la materia | Créditos | Temas principales</code>.
            </p>
            <textarea
              id="manualSubjects"
              rows={9}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={"Semestre 1\nFundamentos de programación | 5 | Variables, ciclos y funciones\nMatemáticas discretas | 5\nBases de datos | 5"}
              className="mt-2 w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 font-mono"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleContinueFromManual}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Revisar materias capturadas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
