"use client";

import { useRef, useState } from "react";
import { getCategory } from "@/data/cc2020-areas";
import { getDiscipline } from "@/data/cc2020-reference";
import { ComparisonView } from "@/components/comparison/ComparisonView";
import { Header, type FlowStep } from "@/components/layout/Header";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";
import { ProcessingStep, type ProcessingStage } from "@/components/upload/ProcessingStep";
import { ReviewStep } from "@/components/upload/ReviewStep";
import { UploadStep } from "@/components/upload/UploadStep";
import { useSessionAnalyses } from "@/hooks/useSessionAnalyses";
import { computeAnalysis, hasClassifiedContent } from "@/lib/analysis/compute";
import { newId } from "@/lib/analysis/manual-parse";
import {
  classifySubjects,
  ClientApiError,
  extractCurriculum,
  summarize,
} from "@/lib/api-client";
import type { ExtractRequest } from "@/lib/validation/schemas";
import type { Curriculum, StoredAnalysis } from "@/types";

export default function HomePage() {
  const {
    analyses,
    activeAnalysis,
    setActiveId,
    upsertAnalysis,
    loadDemo,
    hasDemo,
    removeAnalysis,
    clearAll,
  } = useSessionAnalyses();

  const [step, setStep] = useState<FlowStep>("upload");
  const [draftCurriculum, setDraftCurriculum] = useState<Curriculum | null>(null);
  const [editingAnalysisId, setEditingAnalysisId] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("extracting");
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  function cancelOngoing() {
    abortRef.current?.abort();
    abortRef.current = null;
    inFlightRef.current = false;
    setStep(processingStage === "extracting" ? "upload" : "review");
  }

  async function handleExtractFromFile(
    request: ExtractRequest,
  ) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setErrorMessage(null);
    setProcessingStage("extracting");
    setBatchProgress(null);
    setStep("processing");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const extracted = await extractCurriculum(request, controller.signal);
      const curriculum: Curriculum = {
        careerName: extracted.careerName || "Carrera universitaria",
        university: extracted.university || "",
        planYear: extracted.planYear || "",
        source: request.source,
        documentQuality: extracted.documentQuality,
        subjects: extracted.subjects.map((s) => ({
          id: newId(),
          name: s.name,
          semester: s.semester,
          credits: s.credits,
          hours: s.hours,
          description: s.description,
        })),
      };
      setDraftCurriculum(curriculum);
      setEditingAnalysisId(null);
      setStep("review");
    } catch (err) {
      if (controller.signal.aborted) return;
      const msg =
        err instanceof ClientApiError
          ? err.message
          : "No pudimos analizar tu documento en este momento. Intenta nuevamente en unos minutos.";
      setErrorMessage(msg);
      setStep("upload");
    } finally {
      if (abortRef.current === controller) {
        inFlightRef.current = false;
        abortRef.current = null;
      }
    }
  }

  function handleManualReady(curriculum: Curriculum) {
    setErrorMessage(null);
    setDraftCurriculum(curriculum);
    setEditingAnalysisId(null);
    setStep("review");
  }

  async function handleConfirmAnalyze(curriculum: Curriculum) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setErrorMessage(null);
    setDraftCurriculum(curriculum);
    setProcessingStage("classifying");
    setBatchProgress({ done: 0, total: curriculum.subjects.length });
    setStep("processing");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { classifications, model } = await classifySubjects(
        curriculum.careerName,
        curriculum.subjects,
        (done, total) => setBatchProgress({ done, total }),
        controller.signal,
      );

      const calc = computeAnalysis(curriculum, classifications);
      if (!hasClassifiedContent(calc)) {
        setErrorMessage(
          "Ninguna de las materias pudo relacionarse con áreas de computación del CC2020. Revisa que los nombres correspondan a asignaturas de una carrera afín a la computación.",
        );
        setStep("review");
        return;
      }

      setProcessingStage("summarizing");
      let aiSummary: string | undefined;
      try {
        const summaryPayload = {
          careerName: curriculum.careerName,
          categories: calc.categories
            .filter((c) => c.share > 0)
            .sort((a, b) => b.share - a.share)
            .map((c) => ({
              name: getCategory(c.category).nameEs,
              percent: Math.round(c.share * 100),
              topSubjects: c.contributions.slice(0, 3).map((x) => x.subjectName),
            })),
          topSimilarities: calc.similarities.slice(0, 3).map((s) => ({
            name: getDiscipline(s.discipline).nameEs,
            index: s.index,
          })),
          nonComputingPercent: Math.round((1 - calc.classifiedFraction) * 100),
          confidence: calc.confidence.level,
        };
        const res = await summarize(summaryPayload, controller.signal);
        aiSummary = res.summary;
      } catch {
        // Si falla la redacción opcional con IA, se usa el resumen determinista local.
      }

      if (controller.signal.aborted) return;
      const stored: StoredAnalysis = {
        id: editingAnalysisId ?? newId("career"),
        createdAt: new Date().toISOString(),
        isDemo: false,
        curriculum,
        classifications,
        aiSummary,
        model,
      };

      upsertAnalysis(stored);
      setStep("results");
    } catch (err) {
      if (controller.signal.aborted) return;
      const msg =
        err instanceof ClientApiError
          ? err.message
          : "No pudimos analizar tu documento en este momento. Intenta nuevamente en unos minutos.";
      setErrorMessage(msg);
      setStep("review");
    } finally {
      if (abortRef.current === controller) {
        inFlightRef.current = false;
        abortRef.current = null;
      }
    }
  }

  function handleStartDemo() {
    setErrorMessage(null);
    loadDemo();
    setStep("results");
  }

  function handleEditActiveSubjects() {
    if (!activeAnalysis) return;
    setErrorMessage(null);
    setDraftCurriculum(activeAnalysis.curriculum);
    setEditingAnalysisId(activeAnalysis.isDemo ? null : activeAnalysis.id);
    setStep("review");
  }

  function handleResetAll() {
    clearAll();
    setDraftCurriculum(null);
    setEditingAnalysisId(null);
    setErrorMessage(null);
    setStep("upload");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        currentStep={step}
        analysesCount={analyses.length}
        onGoHome={() => setStep("upload")}
        onOpenCompare={() => setStep("compare")}
      />

      <main className="flex-1">
        {(step === "upload" || (step === "processing" && processingStage === "extracting")) && (
          <div hidden={step !== "upload"}>
          <UploadStep
            onExtractWithAi={handleExtractFromFile}
            onManualReady={handleManualReady}
            onTryDemo={handleStartDemo}

            errorMessage={errorMessage}
          />
          </div>
        )}

        {step === "review" && draftCurriculum && (
          <ReviewStep
            initialCurriculum={draftCurriculum}
            onConfirmAnalyze={handleConfirmAnalyze}
            onBackToUpload={() => {
              setErrorMessage(null);
              setStep("upload");
            }}
            errorMessage={errorMessage}
          />
        )}

        {step === "processing" && (
          <ProcessingStep
            stage={processingStage}
            batchInfo={batchProgress}
            onCancel={cancelOngoing}
          />
        )}

        {step === "results" && activeAnalysis && (
          <ResultsDashboard
            stored={activeAnalysis}
            allAnalyses={analyses}
            onSelectAnalysis={(id) => setActiveId(id)}
            onEditSubjects={handleEditActiveSubjects}
            onStartNewAnalysis={() => {
              setErrorMessage(null);
              setDraftCurriculum(null);
              setEditingAnalysisId(null);
              setStep("upload");
            }}
            onOpenCompare={() => setStep("compare")}
            onResetAll={handleResetAll}
          />
        )}

        {step === "compare" && (
          <ComparisonView
            analyses={analyses}
            hasDemo={hasDemo}
            onAddAnotherCareer={() => {
              setErrorMessage(null);
              setDraftCurriculum(null);
              setEditingAnalysisId(null);
              setStep("upload");
            }}
            onAddDemoCareer={() => {
              loadDemo();
            }}
            onSelectCareerResult={(id) => {
              setActiveId(id);
              setStep("results");
            }}
            onRemoveCareer={removeAnalysis}
            onBackToResults={() => setStep(activeAnalysis ? "results" : "upload")}
          />
        )}
      </main>


    </div>
  );
}

