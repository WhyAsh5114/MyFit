import { fromDate, getLocalTimeZone } from '@internationalized/date';
import { formatHex } from 'culori';

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

export function oklchToHex(oklchString: string): string {
	const cleaned = oklchString.replace(/oklch\(|\)/g, '').trim();
	const [l, c, h] = cleaned.split(/\s+/).map((val, index) => {
		const num = parseFloat(val);
		if (index === 0) return Math.max(0, Math.min(1, num)); // lightness
		if (index === 1) return Math.max(0, Math.min(0.4, num)); // chroma
		if (index === 2) return num % 360; // hue
		return num;
	});

	const oklchColor = { mode: 'oklch' as const, l, c, h: h || 0 };
	return formatHex(oklchColor) || '#000000';
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
