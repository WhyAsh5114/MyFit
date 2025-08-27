import { Capacitor } from '@capacitor/core';
import { Health, type HealthPermission } from 'capacitor-health';

class HealthState {
	async isNative() {
		if (!Capacitor.isNativePlatform()) return false;
		const { available } = await Health.isHealthAvailable();
		return available;
	}

	async getPermissions(permissionsArray: HealthPermission[]) {
		if (!this.isNative()) return null;

		const { permissions } = await Health.checkHealthPermissions({
			permissions: permissionsArray
		});
		// @ts-expect-error: Types aren't up-to-date
		return permissions as Record<HealthPermission, boolean>;
	}

	async requestPermissions(permissionsArray: HealthPermission[]) {
		if (!this.isNative()) return null;

		const { permissions } = await Health.requestHealthPermissions({
			permissions: permissionsArray
		});
		// @ts-expect-error: Types aren't up-to-date
		return permissions as Record<HealthPermission, boolean>;
	}

	async getTotalCaloriesForDay(date: Date) {
		const permissions = await this.requestPermissions(['READ_STEPS', 'READ_ACTIVE_CALORIES']);
		if (permissions === null) return null;
		if (!permissions['READ_ACTIVE_CALORIES'] || !permissions['READ_STEPS']) return null;

		const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

		const calorieQuery = await Health.queryAggregated({
			dataType: 'active-calories',
			startDate: startOfDay.toISOString(),
			endDate: endOfDay.toISOString(),
			bucket: 'day'
		});

		const stepQuery = await Health.queryAggregated({
			dataType: 'steps',
			startDate: startOfDay.toISOString(),
			endDate: endOfDay.toISOString(),
			bucket: 'day'
		});

		return {
			calories: calorieQuery.aggregatedData[0].value ?? 0,
			steps: stepQuery.aggregatedData[0].value ?? 0
		};
	}
}

export const healthState = new HealthState();
