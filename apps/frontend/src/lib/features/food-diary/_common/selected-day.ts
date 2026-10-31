import { getLocalTimeZone, parseDate, today, type CalendarDate } from '@internationalized/date';

/** The day a diary route shows; a missing or malformed date falls back to today. */
export function parseSelectedDay(dateParam: string | undefined): CalendarDate {
	if (dateParam) {
		try {
			return parseDate(dateParam);
		} catch (error) {
			console.warn(`Invalid date parameter: ${dateParam}`, error);
		}
	}
	return today(getLocalTimeZone());
}
