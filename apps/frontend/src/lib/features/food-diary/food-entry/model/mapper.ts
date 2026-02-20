import type { FoodEntryFormSchema } from '$lib/features/food-diary/food-entry/model/schema';
import type { Prisma } from '@myfit/api/prisma/client';

export function foodEntryFormSchemaToFoodEntry(
	input: FoodEntryFormSchema,
	userId: string
): Prisma.FoodEntryUncheckedCreateInput {
	return { ...input, userId };
}

export function foodEntryToFoodEntryFormSchema(
	foodEntry: Prisma.FoodEntryUncheckedCreateInput,
	date?: string,
	meal?: string
): FoodEntryFormSchema {
	const eatenAt = date ? new Date(date) : new Date();
	const now = new Date();
	eatenAt.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

	return {
		...foodEntry,
		eatenAt
	};
}
