import type { CalendarDate } from '@internationalized/date';
import { and } from '@prisma-idb/client-idb/orm';
import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/data/dependencies.js';
import { dayBounds } from '../../_common/day-bounds';
import { foodEntryKeys } from '../keys';

type Args = { userId: string; from: CalendarDate; to: CalendarDate };

/** A user's food entries from the start of `from` to the end of `to`, oldest first, each with its meal. */
export const getFoodEntriesByRange = defineReader({
	keys: ({ userId }: Args) => [foodEntryKeys.byUser(userId)],
	read: async ({ userId, from, to }) => {
		const start = dayBounds(from).start;
		const end = dayBounds(to).end;
		const { orm } = await getDb();
		return await orm.foodEntry
			.where({ userId })
			.where((f) => and(f.eatenAt.gte(start), f.eatenAt.lt(end)))
			.orderBy({ eatenAt: 'asc' })
			.include('meal')
			.all();
	}
});
