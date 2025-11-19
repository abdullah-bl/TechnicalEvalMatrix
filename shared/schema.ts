import { z } from "zod";

// Evaluation Criteria Schema
export const criterionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "اسم المعيار مطلوب"),
  weight: z.number().min(0).max(100),
});

export type Criterion = z.infer<typeof criterionSchema>;

// Competitor Schema
export const competitorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "اسم المتنافس مطلوب"),
});

export type Competitor = z.infer<typeof competitorSchema>;

// Score Schema - individual score for a criterion/competitor pair
export const scoreSchema = z.object({
  criterionId: z.string(),
  competitorId: z.string(),
  score: z.number().min(0).max(100),
});

export type Score = z.infer<typeof scoreSchema>;

// Evaluation Project Schema - complete evaluation state
export const evaluationProjectSchema = z.object({
  criteria: z.array(criterionSchema),
  competitors: z.array(competitorSchema),
  scores: z.array(scoreSchema),
  projectTitle: z.string().default("مصفوفة التقييم الفنية"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type EvaluationProject = z.infer<typeof evaluationProjectSchema>;

// Insert schemas (same as main schemas for localStorage)
export const insertCriterionSchema = criterionSchema.omit({ id: true });
export const insertCompetitorSchema = competitorSchema.omit({ id: true });

export type InsertCriterion = z.infer<typeof insertCriterionSchema>;
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;
