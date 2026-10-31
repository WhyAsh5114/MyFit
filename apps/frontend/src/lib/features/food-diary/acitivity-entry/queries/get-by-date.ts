import type { CalendarDate } from '@internationalized/date';
import { and } from '@prisma-idb/client-idb/orm';
import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { dayBounds } from '../../_common/day-bounds';
import { activityEntryKeys } from '../keys';

/** A user's activity entries for one diary day. */
export async function getActivityEntriesByDate(
	depends: Depends,
	{ userId, date }: { userId: string; date: CalendarDate }
) {
	dependOn(depends, activityEntryKeys.byDate(userId, date.toString()));
	const { start, end } = dayBounds(date);
	const { orm } = await getDb();
	return await orm.activityEntry
		.where({ userId })
		.where((a) => and(a.performedAt.gte(start), a.performedAt.lt(end)))
		.all();
}
