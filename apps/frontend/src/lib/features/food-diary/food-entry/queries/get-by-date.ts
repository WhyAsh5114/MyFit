import type { CalendarDate } from '@internationalized/date';
import { and } from '@prisma-idb/client-idb/orm';
import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/features/dependencies.js';
import { dayBounds } from '../../_common/day-bounds';
import { foodEntryKeys } from '../keys';

type Args = { userId: string; date: CalendarDate };

/** A user's food entries for one diary day, oldest first, each with its meal. */
export const getFoodEntriesByDate = defineReader({
	keys: ({ userId, date }: Args) => [foodEntryKeys.byDate(userId, date.toString())],
	read: async ({ userId, date }) => {
		const { start, end } = dayBounds(date);
		const { orm } = await getDb();
		return await orm.foodEntry
			.where({ userId })
			.where((f) => and(f.eatenAt.gte(start), f.eatenAt.lt(end)))
			.orderBy({ eatenAt: 'asc' })
			.include('meal')
			.all();
	}
});
