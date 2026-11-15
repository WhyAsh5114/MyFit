import z from 'zod';
import { m } from '#lib/paraglide/messages.js';
import { EMPTY_NUMBER } from '../../_common/empty-number.js';
import { optionalNutrientsShape, requiredNutrientsShape } from '../../_common/nutrients.js';

export const foodEntryFormSchema = z.object({
	productName: z.string().min(1, { error: () => m['validation.required']() }),
	brands: z.string().nullable().optional(),
	eatenAt: z.date(),
	quantityG: z
		.number()
		.positive({ error: () => m['validation.positive']() })
		.default(EMPTY_NUMBER),
	servingSize: z.string().nullable().optional(),
	servingQuantity: z.number().nullable().optional(),
	preferredUnit: z.enum(['g', 'serving']),
	mealId: z
		.string()
		.transform((val) => (val === '' ? null : val))
		.optional()
		.nullable(),
	...requiredNutrientsShape,
	...optionalNutrientsShape
});

export type FoodEntryFormSchema = z.infer<typeof foodEntryFormSchema>;
