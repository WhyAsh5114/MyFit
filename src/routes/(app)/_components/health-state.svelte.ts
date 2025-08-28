import { Capacitor } from '@capacitor/core';
import { Health, type HealthPermission } from 'capacitor-health';
import { CalendarDateTime, fromDate, getLocalTimeZone } from '@internationalized/date';

class HealthState {
	async isNative() {
		if (!Capacitor.isNativePlatform()) return false;
		const { available } = await Health.isHealthAvailable();
		return available;
	}

	async getPermissions(permissionsArray: HealthPermission[]) {
		if (!(await this.isNative())) return null;

		const { permissions } = await Health.checkHealthPermissions({
			permissions: permissionsArray
		});
		// @ts-expect-error: Types aren't up-to-date
		return permissions as Record<HealthPermission, boolean>;
	}

	async requestPermissions(permissionsArray: HealthPermission[]) {
		if (!(await this.isNative())) return null;

		const { permissions } = await Health.requestHealthPermissions({
			permissions: permissionsArray
		});
		// @ts-expect-error: Types aren't up-to-date
		return permissions as Record<HealthPermission, boolean>;
	}

	async getStepsForDay(date: Date) {
		const permissions = await this.requestPermissions(['READ_STEPS']);
		if (permissions === null) return null;
		if (!permissions['READ_STEPS']) return null;

		const calDate = fromDate(date, getLocalTimeZone());
		const startOfDay = new CalendarDateTime(calDate.year, calDate.month, calDate.day, 0, 0, 0, 0);
		const endOfDay = new CalendarDateTime(calDate.year, calDate.month, calDate.day, 23, 59, 59, 999);

		const stepQuery = await Health.queryAggregated({
			dataType: 'steps',
			startDate: startOfDay.toDate(getLocalTimeZone()).toISOString(),
			endDate: endOfDay.toDate(getLocalTimeZone()).toISOString(),
			bucket: 'day'
		});

		return stepQuery.aggregatedData[0].value ?? 0;
	}
}

export const healthState = new HealthState();
