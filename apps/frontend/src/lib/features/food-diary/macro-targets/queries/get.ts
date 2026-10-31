import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { macroTargetsKeys } from '../keys';

/** A user's latest macro targets, or `null` when they have none. */
export async function getMacroTargets(depends: Depends, userId: string) {
	dependOn(depends, macroTargetsKeys.byUser(userId));
	const { orm } = await getDb();
	return await orm.macroTargets.where({ userId }).orderBy({ effectiveFrom: 'desc' }).first();
}
