/** How many days it takes an entry's weight in the ranking to halve. */
export const HISTORY_HALF_LIFE_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTES_PER_DAY = 24 * 60;

/** The fields of a logged entry that ranking and meal choice read. */
export type HistoryEntryLike = {
	productName: string;
	brands?: string | null;
	eatenAt: Date;
	mealId?: string | null;
};

/** One food from the user's diary: its latest entry, how often and how recently it was logged. */
export type HistoryFood<T extends HistoryEntryLike> = {
	key: string;
	/** The latest entry of this food. Logging it again copies its values. */
	latest: T;
	count: number;
	/** Frequency and recency in one number: each entry adds 1, halving every half-life. */
	score: number;
	/** Each entry's meal and minute of the day, latest first, to pick a meal by time. */
	meals: { mealId: string | null; minute: number }[];
};

/** Lower case, accents removed and spaces collapsed, so spellings of one food group together. */
export function foldText(text: string) {
	return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

const words = (text: string) => foldText(text).match(/[\p{L}\p{N}]+/gu) ?? [];

const minuteOfDay = (moment: Date) => moment.getHours() * 60 + moment.getMinutes();

/**
 * Group entries into foods by name and brand, and rank them by frequency and recency together:
 * an entry logged today counts 1, one logged a half-life ago 0.5. Ties go to the latest.
 */
export function rankFoodHistory<T extends HistoryEntryLike>(
	entries: readonly T[],
	now: Date
): HistoryFood<T>[] {
	const foods = new Map<string, HistoryFood<T>>();
	const latestFirst = [...entries].sort((a, b) => b.eatenAt.getTime() - a.eatenAt.getTime());
	for (const entry of latestFirst) {
		const key = `${foldText(entry.productName)}\u0000${foldText(entry.brands ?? '')}`;
		const ageDays = Math.max(0, now.getTime() - entry.eatenAt.getTime()) / DAY_MS;
		const weight = 0.5 ** (ageDays / HISTORY_HALF_LIFE_DAYS);
		const meal = { mealId: entry.mealId ?? null, minute: minuteOfDay(entry.eatenAt) };
		const food = foods.get(key);
		if (food) {
			food.count++;
			food.score += weight;
			food.meals.push(meal);
		} else {
			foods.set(key, { key, latest: entry, count: 1, score: weight, meals: [meal] });
		}
	}
	return [...foods.values()].sort(
		(a, b) =>
			b.score - a.score ||
			b.latest.eatenAt.getTime() - a.latest.eatenAt.getTime() ||
			a.key.localeCompare(b.key)
	);
}

/** Whether every word typed starts a word of the food's name or brand. */
export function matchesHistorySearch(food: HistoryEntryLike, search: string) {
	const typed = words(search);
	if (typed.length === 0) return false;
	const own = words(`${food.productName} ${food.brands ?? ''}`);
	return typed.every((word) => own.some((candidate) => candidate.startsWith(word)));
}

/** Minutes either side of a time of day that count as the same mealtime. */
export const MEALTIME_WINDOW_MINUTES = 90;

/** When an entry in a meal was logged: its meal and minute of the day. */
export type MealTime = { mealId: string; minute: number };

/** Each entry's meal and minute of the day, for the entries logged in a meal. */
export function mealTimes(entries: readonly HistoryEntryLike[]): MealTime[] {
	return entries.flatMap((entry) =>
		entry.mealId ? [{ mealId: entry.mealId, minute: minuteOfDay(entry.eatenAt) }] : []
	);
}

const circularGap = (a: number, b: number) => {
	const gap = Math.abs(a - b);
	return Math.min(gap, MINUTES_PER_DAY - gap);
};

/**
 * The meal the user usually logs at this time of day: the active meal with the most entries within
 * the mealtime window of `at`, across all foods. On a tie, the one with an entry nearest `at`.
 * `null` when nothing was logged in an active meal near this time.
 */
export function usualMealAt(
	times: readonly MealTime[],
	activeMealIds: ReadonlySet<string>,
	at: Date
): string | null {
	const minute = minuteOfDay(at);
	const meals = new Map<string, { count: number; nearest: number }>();
	for (const time of times) {
		if (!activeMealIds.has(time.mealId)) continue;
		const gap = circularGap(time.minute, minute);
		if (gap > MEALTIME_WINDOW_MINUTES) continue;
		const meal = meals.get(time.mealId) ?? { count: 0, nearest: Infinity };
		meal.count++;
		meal.nearest = Math.min(meal.nearest, gap);
		meals.set(time.mealId, meal);
	}
	let best: { mealId: string; count: number; nearest: number } | null = null;
	for (const [mealId, meal] of meals) {
		if (
			!best ||
			meal.count > best.count ||
			(meal.count === best.count && meal.nearest < best.nearest)
		)
			best = { mealId, ...meal };
	}
	return best?.mealId ?? null;
}

/**
 * The active meal a food was logged in closest to the time of day of `at`, the latest on a tie, for
 * when the user has no usual meal at that time. `null` when it was never logged in a meal that is
 * still active.
 */
export function mealForTime(
	food: Pick<HistoryFood<HistoryEntryLike>, 'meals'>,
	activeMealIds: ReadonlySet<string>,
	at: Date
): string | null {
	const minute = minuteOfDay(at);
	let best: { mealId: string; distance: number } | null = null;
	for (const { mealId, minute: logged } of food.meals) {
		if (!mealId || !activeMealIds.has(mealId)) continue;
		const distance = circularGap(logged, minute);
		if (!best || distance < best.distance) best = { mealId, distance };
	}
	return best?.mealId ?? null;
}
