import {
	fromDate,
	getLocalTimeZone,
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
