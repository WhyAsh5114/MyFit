import type { CalendarDate } from '@internationalized/date';
import { getDb } from '#lib/clients/idb-client.js';
import { defineReader } from '#lib/features/data/dependencies.js';
import { dayBounds } from '../../_common/day-bounds';
import { macroMetricsKeys } from '../keys';

type Args = { userId: string; date: CalendarDate };

/** The body metrics in effect on one diary day, or `null` when none had started yet. */
export const getMacroMetricsByDate = defineReader({
	keys: ({ userId, date }: Args) => [macroMetricsKeys.byDate(userId, date.toString())],
	read: async ({ userId, date }) => {
		const { end } = dayBounds(date);
		const { orm } = await getDb();
		return await orm.macroMetrics
			.where({ userId })
			.where((row) => row.effectiveFrom.lt(end))
			.orderBy({ effectiveFrom: 'desc' })
			.first();
	}
});
