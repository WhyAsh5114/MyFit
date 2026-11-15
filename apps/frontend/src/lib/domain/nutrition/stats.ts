import type { Row } from '@myfit/shared/client';
import { calculateBMR } from './bmr.js';
import { forQuantity } from './portion.js';

type CalculateDailyNutritionStatsArgs = {
	metrics: Row<'MacroMetrics'>;
	weeklyCaloricChange: number;
	foodEntries?: Pick<Row<'FoodEntry'>, 'energyKcal_100g' | 'quantityG'>[];
	activityEntries?: { calories: number }[];
};

export function calculateDailyNutritionStats(data: CalculateDailyNutritionStatsArgs) {
	const { metrics, weeklyCaloricChange, foodEntries = [], activityEntries = [] } = data;

	const bmr = calculateBMR(metrics);
	if (bmr === null) return null;

	const caloriesConsumed = foodEntries.reduce(
		(sum, entry) => sum + forQuantity(entry.energyKcal_100g, entry.quantityG),
		0
	);
	const caloriesBurned = activityEntries.reduce((sum, entry) => sum + entry.calories, 0);

	const targetCalories = bmr + weeklyCaloricChange / 7;
	const caloriesRemaining = targetCalories - caloriesConsumed + caloriesBurned;

	return {
		bmr,
		caloriesConsumed,
		caloriesBurned,
		targetCalories,
		caloriesRemaining
	};
}
