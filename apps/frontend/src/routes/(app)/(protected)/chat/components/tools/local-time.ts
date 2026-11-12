import {
	fromDate,
	getLocalTimeZone,
	parseDateTime,
	toCalendarDate,
	today
} from '@internationalized/date';
import { shortDateFormatter, timeFormatter } from '#lib/my-utils.js';

const pad = (value: number) => String(value).padStart(2, '0');

/** The local wall-clock time of a moment, as HH:mm. */
export const localTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/**
 * The moment a local date and time (YYYY-MM-DDTHH:mm, from the model) names in the user's time
 * zone, or `null` when it is missing or invalid.
 */
export function parseLocalDateTime(value: string | null | undefined): Date | null {
	if (!value) return null;
	try {
		return parseDateTime(value).toDate(getLocalTimeZone());
	} catch {
		return null;
	}
}

/** When an entry was eaten, as the card shows it: the time alone for today, else the day too. */
export function whenLabel(date: Date): string {
	const time = timeFormatter.format(date);
	const day = toCalendarDate(fromDate(date, getLocalTimeZone()));
	if (day.compare(today(getLocalTimeZone())) === 0) return time;
	return `${shortDateFormatter.format(date)}, ${time}`;
}
