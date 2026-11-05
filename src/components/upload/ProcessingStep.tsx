export type ProcessingStage = "extracting" | "classifying" | "summarizing";

interface ProcessingStepProps {
  stage: ProcessingStage;
  batchInfo?: { done: number; total: number } | null;
  onCancel?: () => void;
}

const labels = {
  extracting: "Identificando materias",
  classifying: "Clasificando materias",
  summarizing: "Preparando resultados",
};

export function ProcessingStep({ stage, batchInfo, onCancel }: ProcessingStepProps) {
  const batch = stage === "classifying" ? batchInfo : null;
  return <section className="processing-panel">
    <div role="status">
      <h1>{labels[stage]}</h1>
      <progress aria-label={labels[stage]} value={batch?.done} max={batch?.total || 1}/>
      {batch && <p>{batch.done} de {batch.total} materias clasificadas</p>}
    </div>
    <button className="quiet-action" onClick={onCancel}>Cancelar</button>
  </section>;
}
