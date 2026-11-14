import { DateFormatter } from '@internationalized/date';
import { getLocale } from '#lib/paraglide/runtime.js';

const dateStyles = {
	/** 14 November 2026 */
	long: { year: 'numeric', month: 'long', day: 'numeric' },
	/** 14 Nov */
	short: { month: 'short', day: 'numeric' },
	/** 4:05 pm */
	time: { hour: 'numeric', minute: 'numeric' }
} satisfies Record<string, Intl.DateTimeFormatOptions>;

type DateStyle = keyof typeof dateStyles;

const formatters = new Map<string, DateFormatter>();

/** A date in the app's language, so Hindi users don't see English month names. */
export function formatDate(date: Date, style: DateStyle): string {
	const locale = getLocale();
	const key = `${locale}:${style}`;
	let formatter = formatters.get(key);
	if (!formatter) {
		formatter = new DateFormatter(locale, dateStyles[style]);
		formatters.set(key, formatter);
	}
	return formatter.format(date);
}

/** A number with the app language's separators; `decimals` caps the fraction digits. */
export function formatNumber(num: number, decimals = 0): string {
	return num.toLocaleString(getLocale(), { maximumFractionDigits: decimals });
}

/** `num` rounded to `decimals` places, for display. */
export function round(num: number, decimals = 2): number {
	const factor = Math.pow(10, decimals);
	return Math.round(num * factor) / factor;
}
