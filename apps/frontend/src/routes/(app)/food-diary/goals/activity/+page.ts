import { enums } from '$lib/clients/idb-client';

export function load() {
	return {
		activityAdjustmentTypes: enums.__unbound__.ActivityAdjustmentType.values
	};
}
