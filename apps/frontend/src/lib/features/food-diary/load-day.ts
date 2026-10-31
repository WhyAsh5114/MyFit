import type { CalendarDate } from '@internationalized/date';
import type { Depends } from '#lib/features/dependencies.js';
import { getActivityEntriesByDate } from './acitivity-entry/queries/get-by-date';
import { getActivityPreferencesByDate } from './activity-preferences/queries/get-by-date';
import { getFoodEntriesByDate } from './food-entry/queries/get-by-date';
import { getMacroMetricsByDate } from './macro-metrics/queries/get-by-date';
import { getMacroTargetsByDate } from './macro-targets/queries/get-by-date';
import { getMeals } from './meals/queries/get';

/** Everything the diary shows for one day, read together so the day appears whole. */
export async function loadDiaryDay(depends: Depends, userId: string, date: CalendarDate) {
	const args = { userId, date };
	const [meals, foodEntries, activityEntries, activityPreferences, macroMetrics, macroTargets] =
		await Promise.all([
			getMeals(depends, userId),
			getFoodEntriesByDate(depends, args),
			getActivityEntriesByDate(depends, args),
			getActivityPreferencesByDate(depends, args),
			getMacroMetricsByDate(depends, args),
			getMacroTargetsByDate(depends, args)
		]);
	return {
		day: date.toString(),
		meals,
		foodEntries,
		activityEntries,
		activityPreferences,
		macroMetrics,
		macroTargets
	};
}
