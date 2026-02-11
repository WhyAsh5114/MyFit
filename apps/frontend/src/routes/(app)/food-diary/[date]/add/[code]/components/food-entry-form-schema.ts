import { z } from 'zod';

export const foodEntryFormSchema = z.object({
	datetime: z.date(),
	quantity: z.number().min(0.1, 'Quantity must be at least 0.1')
});

export type FoodEntryFormSchema = typeof foodEntryFormSchema;
