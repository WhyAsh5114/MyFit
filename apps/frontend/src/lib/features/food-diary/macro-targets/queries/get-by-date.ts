import type { CalendarDate } from '@internationalized/date';
import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { dayBounds } from '../../_common/day-bounds';
import { macroTargetsKeys } from '../keys';

/** The macro targets in effect on one diary day, or `null` when none had started yet. */
export async function getMacroTargetsByDate(
	depends: Depends,
	{ userId, date }: { userId: string; date: CalendarDate }
) {
	dependOn(depends, macroTargetsKeys.byDate(userId, date.toString()));
	const { end } = dayBounds(date);
	const { orm } = await getDb();
	return await orm.macroTargets
		.where({ userId })
		.where((row) => row.effectiveFrom.lt(end))
		.orderBy({ effectiveFrom: 'desc' })
		.first();
}
