import { z } from 'zod';

export const macroTrackingMetricsSchema = z.object({
  bodyweight: z.number().min(0, 'Bodyweight must be a positive number').default(0),
  bodyweightUnit: z.enum(['kg', 'lb']),
  height: z.number().min(0, 'Height must be a positive number').default(0),
  heightUnit: z.enum(['cm', 'in']),
  gender: z.enum(['Male', 'Female']),
  age: z.number().min(0, 'Age must be a positive number').default(0),
  bodyFatPercentage: z
    .number()
    .min(0, 'Body fat percentage must be a positive number')
    .max(100, 'Body fat percentage must be less than 100%')
    .default(0)
});

export type MacroTrackingMetricsSchema = z.infer<typeof macroTrackingMetricsSchema>;
