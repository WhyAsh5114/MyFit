import type { CalendarDate } from '@internationalized/date';
import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/features/dependencies.js';
import { dayBounds } from '../../_common/day-bounds';
import { activityPreferencesKeys } from '../keys';

type Args = { userId: string; date: CalendarDate };

/** The activity preferences in effect on one diary day, or `null` when none had started yet. */
export const getActivityPreferencesByDate = defineReader({
	keys: ({ userId, date }: Args) => [activityPreferencesKeys.byDate(userId, date.toString())],
	read: async ({ userId, date }) => {
		const { end } = dayBounds(date);
		const { orm } = await getDb();
		return await orm.activityPreferences
			.where({ userId })
			.where((row) => row.effectiveFrom.lt(end))
			.orderBy({ effectiveFrom: 'desc' })
			.first();
	}
});
