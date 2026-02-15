import { DateFormatter, fromDate, getLocalTimeZone } from '@internationalized/date';

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

export const dateFormatter = new DateFormatter('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
});

export const shortDateFormatter = new DateFormatter('en-US', {
	month: 'short',
	day: 'numeric'
});

export const timeFormatter = new DateFormatter('en-US', {
	hour: 'numeric',
	minute: 'numeric'
});

export function formatDateToISO(date: Date): string {
	const calendarDate = fromDate(date, getLocalTimeZone());
	return calendarDate.toString();
}

export function round(num: number, decimals = 2): number {
	const factor = Math.pow(10, decimals);
	return Math.round(num * factor) / factor;
}
