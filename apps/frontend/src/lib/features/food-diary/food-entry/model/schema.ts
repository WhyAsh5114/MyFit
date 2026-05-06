import z from 'zod';
import { optionalNutrientsShape, requiredNutrientsShape } from '../../_common/nutrients';

export const foodEntryFormSchema = z.object({
	productName: z.string().min(1, 'Product name is required'),
	brands: z.string().nullable().optional(),
	eatenAt: z.date(),
	quantityG: z
		.number()
		.positive('Quantity must be greater than zero')
		.default('' as unknown as number),
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
