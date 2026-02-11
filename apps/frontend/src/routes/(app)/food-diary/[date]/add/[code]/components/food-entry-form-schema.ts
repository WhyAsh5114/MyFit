import { validators } from '@myfit/api/validators';
import type z from 'zod';

export const foodEntryFormSchema = validators.FoodEntry.omit({ id: true, userId: true })
	.loose()
	.extend({
		quantity: validators.FoodEntry.shape.quantity.min(1, { message: 'Quantity must be at least 1' }),
		carbohydrates_100g: validators.FoodEntry.shape.carbohydrates_100g.min(0, { message: 'Carbohydrates per 100g must be at least 0' }),
		proteins_100g: validators.FoodEntry.shape.proteins_100g.min(0, { message: 'Protein per 100g must be at least 0' }),
		fat_100g: validators.FoodEntry.shape.fat_100g.min(0, { message: 'Fat per 100g must be at least 0' })
	});

export type FoodEntryFormSchema = z.infer<typeof foodEntryFormSchema>;
