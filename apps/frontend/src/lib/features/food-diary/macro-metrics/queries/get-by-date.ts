import type { CalendarDate } from '@internationalized/date';
import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { dayBounds } from '../../_common/day-bounds';
import { macroMetricsKeys } from '../keys';

/** The body metrics in effect on one diary day, or `null` when none had started yet. */
export async function getMacroMetricsByDate(
	depends: Depends,
	{ userId, date }: { userId: string; date: CalendarDate }
) {
	dependOn(depends, macroMetricsKeys.byDate(userId, date.toString()));
	const { end } = dayBounds(date);
	const { orm } = await getDb();
	return await orm.macroMetrics
		.where({ userId })
		.where((row) => row.effectiveFrom.lt(end))
		.orderBy({ effectiveFrom: 'desc' })
		.first();
}
