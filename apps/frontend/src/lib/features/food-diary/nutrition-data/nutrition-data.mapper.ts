import type { NutritionData } from '@myfit/api/prisma/client';
import type { FoodEntryFormSchema } from '../food-entry/food-entry.schema';

export function nutritionDataToFoodEntryFormData(
	nutritionData: NutritionData,
	date?: string,
	meal?: string
): FoodEntryFormSchema {
	const eatenAt = date ? new Date(date) : new Date();
	const now = new Date();
	eatenAt.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

	let quantityG = 100;
	let preferredUnit: 'g' | 'serving' = 'g';

	if (nutritionData.servingSize && nutritionData.servingQuantity !== null) {
		quantityG = nutritionData.servingQuantity;
		preferredUnit = 'serving';
	}

	return {
		...nutritionData,
		quantityG,
		eatenAt,
		preferredUnit
	};
}
