import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { macroMetricsKeys } from '../keys';

/** A user's latest body metrics, or `null` when they have none. */
export async function getMacroMetrics(depends: Depends, userId: string) {
	dependOn(depends, macroMetricsKeys.byUser(userId));
	const { orm } = await getDb();
	return await orm.macroMetrics.where({ userId }).orderBy({ effectiveFrom: 'desc' }).first();
}
