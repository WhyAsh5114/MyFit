import type { FoodEntryFormSchema } from '#lib/features/food-diary/food-entry/model/schema.js';
import type { NewRow } from '@myfit/shared/client';

export function foodEntryFormSchemaToFoodEntry(
	input: FoodEntryFormSchema,
	userId: string
): NewRow<'FoodEntry'> {
	return { ...input, recipeId: null, userId };
}

/** The form values of a stored entry. It keeps the entry's own `eatenAt`, so an edit never moves it. */
export function foodEntryToFoodEntryFormSchema(
	foodEntry: NewRow<'FoodEntry'>
): FoodEntryFormSchema {
	return { ...foodEntry };
}
