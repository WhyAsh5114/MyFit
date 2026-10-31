import type { CalendarDate } from '@internationalized/date';
import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { dayBounds } from '../../_common/day-bounds';
import { activityPreferencesKeys } from '../keys';

/** The activity preferences in effect on one diary day, or `null` when none had started yet. */
export async function getActivityPreferencesByDate(
	depends: Depends,
	{ userId, date }: { userId: string; date: CalendarDate }
) {
	dependOn(depends, activityPreferencesKeys.byDate(userId, date.toString()));
	const { end } = dayBounds(date);
	const { orm } = await getDb();
	return await orm.activityPreferences
		.where({ userId })
		.where((row) => row.effectiveFrom.lt(end))
		.orderBy({ effectiveFrom: 'desc' })
		.first();
}
