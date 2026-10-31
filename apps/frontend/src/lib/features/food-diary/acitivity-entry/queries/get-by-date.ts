import type { CalendarDate } from '@internationalized/date';
import { and } from '@prisma-idb/client-idb/orm';
import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/features/data/dependencies.js';
import { dayBounds } from '../../_common/day-bounds';
import { activityEntryKeys } from '../keys';

type Args = { userId: string; date: CalendarDate };

/** A user's activity entries for one diary day. */
export const getActivityEntriesByDate = defineReader({
	keys: ({ userId, date }: Args) => [activityEntryKeys.byDate(userId, date.toString())],
	read: async ({ userId, date }) => {
		const { start, end } = dayBounds(date);
		const { orm } = await getDb();
		return await orm.activityEntry
			.where({ userId })
			.where((a) => and(a.performedAt.gte(start), a.performedAt.lt(end)))
			.all();
	}
});
