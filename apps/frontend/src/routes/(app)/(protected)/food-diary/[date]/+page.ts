import { getActivityEntriesByDate } from '#lib/features/food-diary/activity-entry/queries/get-by-date.js';
import { getActivityPreferencesByDate } from '#lib/features/food-diary/activity-preferences/queries/get-by-date.js';
import { getFoodEntriesByDate } from '#lib/features/food-diary/food-entry/queries/get-by-date.js';
import { getMacroMetricsByDate } from '#lib/features/food-diary/macro-metrics/queries/get-by-date.js';
import { getMacroTargetsByDate } from '#lib/features/food-diary/macro-targets/queries/get-by-date.js';
import { getMeals } from '#lib/features/food-diary/meals/queries/get.js';
import { parseSelectedDay } from '#lib/features/food-diary/_common/selected-day.js';
import {
	unsavedFixedActivity,
	withGeneratedActivity
} from '#lib/domain/nutrition/generated-activity.js';
import { getLocalTimeZone, today } from '@internationalized/date';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, parent }) => {
	const { ownerId } = await parent();
	const date = parseSelectedDay(params.date);
	const args = { userId: ownerId, date };

	const [meals, foodEntries, activityEntries, activityPreferences, macroMetrics, macroTargets] =
		await Promise.all([
			getMeals(depends, ownerId),
			getFoodEntriesByDate(depends, args),
			getActivityEntriesByDate(depends, args),
			getActivityPreferencesByDate(depends, args),
			getMacroMetricsByDate(depends, args),
			getMacroTargetsByDate(depends, args)
		]);
	// A fixed amount is known from the preferences, so the day shows it before it is saved.
	const fixedActivity = unsavedFixedActivity({
		userId: ownerId,
		day: date.toString(),
		today: today(getLocalTimeZone()).toString(),
		startOfDay: date.toDate(getLocalTimeZone()),
		entries: activityEntries,
		preferences: activityPreferences
	});
	return {
		day: date.toString(),
		meals,
		foodEntries,
		activityEntries: withGeneratedActivity(activityEntries, fixedActivity),
		/** Saved by `SyncHealthData`; until then it is already in `activityEntries`. */
		fixedActivity,
		activityPreferences,
		macroMetrics,
		macroTargets
	};
};
