import type { MacroMetrics } from '@myfit/api/prisma/client';
import { calculateBMR } from './bmr';

type CalculateDailyNutritionStatsArgs = {
	metrics: MacroMetrics;
	weeklyCaloricChange: number;
	foodEntries?: { energyKcal_100g: number }[];
};

export function calculateDailyNutritionStats(data: CalculateDailyNutritionStatsArgs) {
	const { metrics, weeklyCaloricChange, foodEntries = [] } = data;

	const bmr = calculateBMR(metrics);
	const caloriesConsumed = foodEntries.reduce((sum, entry) => sum + entry.energyKcal_100g, 0);
	const targetCalories = bmr + weeklyCaloricChange / 7;

	const caloriesRemaining = targetCalories - caloriesConsumed;

	return {
		bmr,
		caloriesConsumed,
		targetCalories,
		caloriesRemaining
	};
}
