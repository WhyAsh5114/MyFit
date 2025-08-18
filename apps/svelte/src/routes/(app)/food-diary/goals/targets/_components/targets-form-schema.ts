import { MacroTargetQuantifier } from '@prisma/client';
import { z } from 'zod';

export const macroTrackingTargetsSchema = z
	.object({
		proteins: z.number().nullable().default(40),
		carbs: z.number().nullable().default(30),
		fats: z.number().nullable().default(30),
		caloricChange: z.number().default(0),
		quantifier: z.enum(MacroTargetQuantifier).default('Percentage')
	})
	.refine(
		(data) => {
			if (data.quantifier !== 'Percentage') return true;
			let total = 0;
			if (data.carbs !== null) total += data.carbs;
			if (data.fats !== null) total += data.fats;
			if (data.proteins !== null) total += data.proteins;

			if (data.carbs !== null && data.fats !== null && data.proteins !== null) {
				return total === 100;
			}
			return total <= 100;
		},
		{ error: 'Macro targets must sum to 100%' }
	);

export type MacroTrackingTargetsSchema = z.infer<typeof macroTrackingTargetsSchema>;
