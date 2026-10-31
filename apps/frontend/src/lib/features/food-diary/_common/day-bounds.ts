import {
	fromDate,
	getLocalTimeZone,
	parseDate,
	toCalendarDate,
	type CalendarDate
} from '@internationalized/date';

/** The local midnights that open and close `date`, as the bounds of its diary day. */
export function dayBounds(date: CalendarDate) {
	const timezone = getLocalTimeZone();

	const start = date.toDate(timezone);
	start.setHours(0, 0, 0, 0);

	const end = date.add({ days: 1 }).toDate(timezone);
	end.setHours(0, 0, 0, 0);

	return { start, end };
}

/** The diary day a moment falls on, in the local time zone. */
export const localDay = (moment: Date) =>
	toCalendarDate(fromDate(moment, getLocalTimeZone())).toString();

/**
 * The current time of day on the diary day `day` (`YYYY-MM-DD`), in the local time zone. Built from
 * the day's parts, because `new Date('YYYY-MM-DD')` is UTC midnight and lands on the previous day
 * west of UTC. Without a valid day it is `now`.
 */
export function momentOnDay(day: string | undefined, now = new Date()) {
	if (!day) return now;
	try {
		const { year, month, day: dayOfMonth } = parseDate(day);
		return new Date(
			year,
			month - 1,
			dayOfMonth,
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds()
		);
	} catch {
		return now;
	}
}
