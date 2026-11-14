import {
	foodEntryFormSchema,
	type FoodEntryFormSchema
} from '#lib/features/food-diary/food-entry/model/schema.js';
import type { NewRow } from '@myfit/shared/client';
import { momentOnDay } from '../../_common/day-bounds';

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

/**
 * A new entry of the same food and amount as a logged one, at the current time on `day`, in
 * `mealId`. Parsing drops the old entry's id and owner, so it is stored as a new row.
 */
export function foodEntryToRepeatFormData(
	foodEntry: NewRow<'FoodEntry'>,
	day: string | undefined,
	mealId: string | null
): FoodEntryFormSchema {
	return foodEntryFormSchema.parse({ ...foodEntry, eatenAt: momentOnDay(day), mealId });
}
