import type { CalendarDate } from '@internationalized/date';
import { and } from '@prisma-idb/client-idb/orm';
import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { dayBounds } from '../../_common/day-bounds';
import { foodEntryKeys } from '../keys';

/** A user's food entries for one diary day, oldest first, each with its meal. */
export async function getFoodEntriesByDate(
	depends: Depends,
	{ userId, date }: { userId: string; date: CalendarDate }
) {
	dependOn(depends, foodEntryKeys.byDate(userId, date.toString()));
	const { start, end } = dayBounds(date);
	const { orm } = await getDb();
	return await orm.foodEntry
		.where({ userId })
		.where((f) => and(f.eatenAt.gte(start), f.eatenAt.lt(end)))
		.orderBy({ eatenAt: 'asc' })
		.include('meal')
		.all();
}
