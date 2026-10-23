import { browser } from '$app/environment';
import { getDb } from '$lib/clients/idb-client';

/** Loads enum options from the migrated database; prerendering leaves them pending. */
export async function load() {
	if (!browser) return { activityAdjustmentTypes: [] };

	const db = await getDb();
	return {
		activityAdjustmentTypes: db.enums.__unbound__.ActivityAdjustmentType.values
	};
}
