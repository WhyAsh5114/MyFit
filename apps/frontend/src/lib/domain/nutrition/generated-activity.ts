import type { Row } from '@myfit/shared/client';

type Entry = Row<'ActivityEntry'>;
type Preferences = Pick<Row<'ActivityPreferences'>, 'adjustmentType' | 'staticCalories'>;

/** The one entry the app generates for an account's day, so devices that sync later converge on it. */
export const generatedActivityId = (userId: string, day: string) =>
	`generated-activity:${userId}:${day}`;

/**
 * The fixed-amount entry a day should have but hasn't saved yet. Its calories come from the
 * activity preferences, so they are known before anything is written. Null for a day that hasn't
 * started (the preferences may change before it does), when the preferences don't ask for a fixed
 * amount, or when the saved entry already matches.
 */
export function unsavedFixedActivity(args: {
	userId: string;
	/** The day, as `YYYY-MM-DD`. */
	day: string;
	/** Today, as `YYYY-MM-DD`. */
	today: string;
	/** When a new entry is dated: the start of the day. */
	startOfDay: Date;
	entries: Entry[];
	preferences: Preferences | null;
}): Entry | null {
	const { userId, day, today, startOfDay, entries, preferences } = args;
	if (day > today) return null;
	if (preferences?.adjustmentType !== 'Static' || !preferences.staticCalories) return null;

	const existing = entries.find((e) => e.systemGenerated);
	if (existing?.quantityUnit === 'day' && existing.calories === preferences.staticCalories) {
		return null;
	}
	return {
		id: generatedActivityId(userId, day),
		userId,
		// Stored in English; the diary names generated entries by their unit, translated.
		name: 'Daily fixed activity',
		performedAt: existing?.performedAt ?? startOfDay,
		calories: preferences.staticCalories,
		quantity: 1,
		quantityUnit: 'day',
		systemGenerated: true
	};
}

/** The entries with `generated` in place of the day's generated entry, or added if there is none. */
export function withGeneratedActivity(entries: Entry[], generated: Entry | null): Entry[] {
	if (!generated) return entries;
	const at = entries.findIndex((e) => e.systemGenerated);
	return at === -1 ? [...entries, generated] : entries.with(at, generated);
}
