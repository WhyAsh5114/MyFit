import { fromDate, getLocalTimeZone } from '@internationalized/date';

export function kebabToCamel(str: string) {
	return str.replace(/-([a-z])/g, (m, w) => w.toUpperCase());
}

export function kebabToNormal(str: string) {
	return str.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function pascalToNormal(str: string) {
	return str.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase());
}

export function snakeToNormal(str: string) {
	return str.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

export function capitalizeWords(str: string) {
	return str
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function formatDateToISO(date: Date): string {
	const calendarDate = fromDate(date, getLocalTimeZone());
	return calendarDate.toString();
}
