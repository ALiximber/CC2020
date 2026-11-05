import type { CategoryId } from "@/data/cc2020-areas";
import type { DisciplineId } from "@/data/cc2020-reference";

/** Materia del plan de estudios (extraída o capturada por el usuario). */
export interface Subject {
  id: string;
  name: string;
  semester: number | null;
  credits: number | null;
  hours: number | null;
  description: string;
}

export type SourceKind = "pdf-text" | "pdf-scan" | "image" | "manual" | "demo";
export type DocumentQuality = "good" | "fair" | "poor";

export interface Curriculum {
  careerName: string;
  university: string;
  planYear: string;
  subjects: Subject[];
  source: SourceKind;
  documentQuality: DocumentQuality;
}

/** Relación materia → área CC2020 propuesta por la IA (o por los datos demo). */
export interface AreaAssignment {
  areaId: string;
  /** Relevancia entre 0 y 1. La suma por materia nunca supera 1. */
  relevance: number;
  justification: string;
}

export interface SubjectClassification {
  subjectId: string;
  assignments: AreaAssignment[];
  /** La IA indicó que la información era insuficiente o ambigua. */
  uncertain: boolean;
  note: string;
}

export type WeightingMethod = "credits" | "hours" | "uniform";

export interface SubjectContribution {
  subjectId: string;
  subjectName: string;
  /** peso × relevancia (sin normalizar). */
  score: number;
  /** Proporción de este puntaje respecto al total clasificado (0–1). */
  share: number;
  justification: string;
}

export interface AreaResult {
  areaId: string;
  category: CategoryId;
  rawScore: number;
  /** Proporción normalizada (0–1) respecto al contenido clasificado. */
  share: number;
  contributions: SubjectContribution[];
}

export interface CategoryResult {
  category: CategoryId;
  share: number;
  rawScore: number;
  areas: AreaResult[];
  contributions: SubjectContribution[];
}

export interface SimilarityResult {
  discipline: DisciplineId;
  /** Similitud coseno (0–1) entre el perfil de la carrera y el perfil de referencia. */
  cosine: number;
  /** Índice 0–100 calculado por la plataforma (no es pertenencia oficial). */
  index: number;
}

export interface MapPoint {
  x: number;
  y: number;
}

export type ConfidenceLevel = "suficiente" | "parcial" | "limitada";

export interface ConfidenceFactor {
  label: string;
  value: string;
  ok: boolean;
}

export interface ConfidenceResult {
  level: ConfidenceLevel;
  points: number;
  maxPoints: number;
  factors: ConfidenceFactor[];
  onlyNames: boolean;
}

export interface AnalysisResult {
  weighting: WeightingMethod;
  totalWeight: number;
  /** Fracción del peso total que pudo relacionarse con áreas CC2020 (0–1). */
  classifiedFraction: number;
  areas: AreaResult[];
  categories: CategoryResult[];
  similarities: SimilarityResult[];
  mapPoint: MapPoint;
  unclassifiedSubjects: { id: string; name: string }[];
  uncertainSubjects: { id: string; name: string; note: string }[];
  confidence: ConfidenceResult;
}

/** Análisis guardado en la sesión del navegador. */
export interface StoredAnalysis {
  id: string;
  createdAt: string;
  isDemo: boolean;
  curriculum: Curriculum;
  classifications: SubjectClassification[];
  /** Resumen redactado por Gemini a partir de los resultados calculados (opcional). */
  aiSummary?: string;
  model?: string;
}

