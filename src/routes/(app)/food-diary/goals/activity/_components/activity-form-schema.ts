import { z } from 'zod';

export const macroTrackingActivitySchema = z
	.object({
		adjustmentType: z.enum(['Static', 'Dynamic', 'Manual']).default('Dynamic'),
		staticCalories: z.number().nullable()
	})
	.refine(
		({ adjustmentType, staticCalories }) =>
			!(adjustmentType === 'Static' && typeof staticCalories !== 'number'),
		{
			error: 'Static calories must be defined when adjustment type is "Static"',
			path: ['staticCalories']
		}
	);

export type MacroTrackingActivitySchema = z.infer<typeof macroTrackingActivitySchema>;
