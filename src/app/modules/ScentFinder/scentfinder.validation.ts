import { z } from 'zod';

const createQuestionSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'Question ID is required'),
    prompt: z.object({
      en: z.string().min(1, 'English prompt is required'),
      bn: z.string().min(1, 'Bengali prompt is required'),
    }),
    options: z.array(
      z.object({
        value: z.enum(['fresh', 'warm', 'floral', 'woody']),
        label: z.object({
          en: z.string().min(1, 'English option label is required'),
          bn: z.string().min(1, 'Bengali option label is required'),
        }),
      })
    ).length(4, 'Exactly 4 options are required'),
  }),
});

export const ScentFinderValidation = {
  createQuestionSchema,
};
