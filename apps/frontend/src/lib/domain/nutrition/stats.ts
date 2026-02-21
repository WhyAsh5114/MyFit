import type { ActivityAdjustmentType, MacroMetrics } from '@myfit/api/prisma/client';
import { calculateBMR } from './bmr';

type CalculateDailyNutritionStatsArgs = {
	metrics: MacroMetrics;
	weeklyCaloricChange: number;
	foodEntries?: { energyKcal_100g: number; quantityG: number }[];
	activityEntries?: { calories: number }[];
};

export function calculateDailyNutritionStats(data: CalculateDailyNutritionStatsArgs) {
	const { metrics, weeklyCaloricChange, foodEntries = [], activityEntries = [] } = data;

	const bmr = calculateBMR(metrics);
	const caloriesConsumed = foodEntries.reduce(
		(sum, entry) => sum + entry.energyKcal_100g * (entry.quantityG / 100),
		0
	);
	let caloriesBurned = activityEntries.reduce((sum, entry) => sum + entry.calories, 0);

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
