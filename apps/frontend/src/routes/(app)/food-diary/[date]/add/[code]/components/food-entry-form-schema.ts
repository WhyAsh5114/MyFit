import { validators } from '@myfit/api/validators';

export const foodEntryFormSchema = validators.FoodEntry.omit({ id: true, userId: true })
	.loose()
	.extend({
		quantity: validators.FoodEntry.shape.quantity.min(1, { message: 'Quantity must be at least 1' })
	});

export type FoodEntryFormSchema = typeof foodEntryFormSchema;
