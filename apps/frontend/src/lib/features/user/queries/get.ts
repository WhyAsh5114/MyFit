import { getDb } from '#lib/clients/idb-client.js';
import { dependOn, type Depends } from '#lib/features/dependencies.js';
import { userKeys } from '../keys';

/** The user the local database belongs to, or `null` when it holds none. */
export async function getLocalUser(depends: Depends) {
	dependOn(depends, userKeys.current());
	const { orm } = await getDb();
	return await orm.user.first();
}
