/** Format elapsed seconds as m:ss, or h:mm:ss once an hour has passed. */
export function formatDuration(seconds: number): string {
	const elapsed = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
	const hours = Math.floor(elapsed / 3600);
	const minutes = Math.floor((elapsed % 3600) / 60);
	const remainingSeconds = (elapsed % 60).toString().padStart(2, '0');
	return hours > 0
		? `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds}`
		: `${minutes}:${remainingSeconds}`;
}
