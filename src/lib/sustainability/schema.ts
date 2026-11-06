import { z } from "zod";
import { SubjectInputSchema } from "@/lib/validation/schemas";

const text = z.string().trim().min(1).max(1800);
const list = z.array(text).min(1).max(8);
const sdgs = z.array(z.number().int().min(1).max(17)).min(1).max(17);
export const EvidenceSourceSchema = z.object({ text: z.string().trim().min(1).max(12000), reference: text.max(500), complete: z.boolean() });
export const SustainabilitySubjectSchema = SubjectInputSchema.extend({ officialProgram: EvidenceSourceSchema.optional() });
export const SubjectInsightSchema = z.object({
  subjectId: z.string().min(1).max(64), knowledge: list,
  explicit: z.object({ status: z.enum(["present", "absent", "unknown"]), evidence: z.array(text).max(5), explanation: text }),
  applications: z.array(z.object({ description: text, problem: text, sdgs, justification: text, professionalApplication: text, project: text })).max(4),
  confidence: z.enum(["high", "medium", "low"]),
});
export const SubjectBatchSchema = z.object({ subjects: z.array(SubjectInsightSchema).min(1).max(8) });
export const RequestSchema = z.object({
  careerName: z.string().max(200), phase: z.enum(["subjects", "learning"]),
  subjects: z.array(SustainabilitySubjectSchema).min(1).max(150),
  classifications: z.array(z.object({ subjectId: z.string().max(64), assignments: z.array(z.object({ areaId: z.string().max(10), relevance: z.number().min(0).max(1), justification: z.string().max(400) })).max(6), uncertain: z.boolean(), note: z.string().max(300) })).max(150),
}).superRefine((v, ctx) => {
  if (v.phase === "subjects" && v.subjects.length > 8) ctx.addIssue({ code: "custom", message: "Máximo 8 materias por lote" });
  if (new Set(v.subjects.map(s => s.id)).size !== v.subjects.length) ctx.addIssue({ code: "custom", message: "IDs duplicados" });
});
export type SubjectInsight = z.infer<typeof SubjectInsightSchema>;
export type SustainabilityRequest = z.infer<typeof RequestSchema>;
const relatedSubjects = z.array(z.string().min(1).max(64)).min(1).max(12);
export const LearningSchema = z.object({
  projects: z.array(z.object({ title: text, problem: text, solution: text, subjectIds: relatedSubjects, technologies: list, sdgs, objective: text, benefits: list, difficulty: z.enum(["inicial", "intermedia", "avanzada"]), indicators: list, limitations: list, additionalKnowledge: z.array(text).max(8) })).min(1).max(4),
  activities: z.array(z.object({ context: text, question: text, options: z.array(text).min(3).max(4), answer: z.number().int().min(0).max(3), explanation: text, tradeoffs: text, subjectIds: relatedSubjects, sdgs })).min(1).max(4),
  sectors: z.array(z.object({ name: text, description: text, problems: list, applications: list, subjectIds: relatedSubjects, competencies: list, professionalProject: text })).min(1).max(5),
});
export type Learning = z.infer<typeof LearningSchema>;
export interface SustainabilityState { version: 1; inputKey: string; subjects: SubjectInsight[]; model?: string; learning?: Learning; learningModel?: string; }
