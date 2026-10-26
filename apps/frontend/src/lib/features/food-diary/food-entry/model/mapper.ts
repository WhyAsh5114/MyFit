import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/model/schema';
import type { NewRow } from '@myfit/shared/client';

export function foodEntryFormSchemaToFoodEntry(
	input: FoodEntryFormSchema,
	userId: string
): NewRow<'FoodEntry'> {
	return { ...input, recipeId: null, userId };
}

export function foodEntryToFoodEntryFormSchema(
	foodEntry: NewRow<'FoodEntry'>,
	date?: string
): FoodEntryFormSchema {
	const eatenAt = date ? new Date(date) : new Date();
	const now = new Date();
	eatenAt.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

	return { ...foodEntry, eatenAt };
}
