export function dateFormatter(timestamp: number) {
	const date = new Date(timestamp);
	return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
