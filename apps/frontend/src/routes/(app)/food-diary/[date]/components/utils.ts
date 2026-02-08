import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';

export function getRelativeDayLabel(date: CalendarDate) {
	const todayDate = today(getLocalTimeZone());
	const daysDiff = date.compare(todayDate);

	if (daysDiff === 0) return 'Today';
	if (daysDiff === -1) return 'Yesterday';
	if (daysDiff === 1) return 'Tomorrow';
	if (daysDiff < -1) return `${Math.abs(daysDiff)} days ago`;
	if (daysDiff > 1) return `In ${daysDiff} days`;
}
