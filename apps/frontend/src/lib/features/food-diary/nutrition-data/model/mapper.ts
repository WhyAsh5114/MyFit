import type { NutritionData } from '@myfit/shared/nutrition';
import { momentOnDay } from '../../_common/day-bounds';
import type { FoodEntryFormSchema } from '../../food-entry/model/schema';

export function nutritionDataToFoodEntryFormData(
	nutritionData: NutritionData,
	date?: string,
	mealId?: string | null
): FoodEntryFormSchema {
	const eatenAt = momentOnDay(date);

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
		preferredUnit,
		mealId
	};
}
