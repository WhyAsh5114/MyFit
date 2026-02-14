import { z } from 'zod';

export const macroTrackingTargetsSchema = z
	.object({
		proteinG: z.number().nullable().default(40),
		carbsG: z.number().nullable().default(30),
		fatG: z.number().nullable().default(30),
		caloricChange: z.number().default(0),
		quantifier: z.enum(['Percentage', 'Absolute']).default('Percentage')
	})
	.refine(
		(data) => {
			if (data.quantifier !== 'Percentage') return true;
			let total = 0;
			if (data.carbsG !== null) total += data.carbsG;
			if (data.fatG !== null) total += data.fatG;
			if (data.proteinG !== null) total += data.proteinG;

			if (data.carbsG !== null && data.fatG !== null && data.proteinG !== null) {
				return total === 100;
			}
			return total <= 100;
		},
		{ error: 'Macro targets must sum to 100%' }
	);

export type MacroTrackingTargetsSchema = z.infer<typeof macroTrackingTargetsSchema>;
