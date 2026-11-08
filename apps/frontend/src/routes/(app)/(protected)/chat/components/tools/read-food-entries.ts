import { parseDate } from '@internationalized/date';
import type { MyUITools } from '@myfit/api';
import { OPTIONAL_NUTRIENT_FIELDS } from '@myfit/shared/nutrition';
import { getFoodEntriesByRange } from '#lib/features/food-diary/food-entry/queries/get-by-range.js';
import { localDay } from '#lib/features/food-diary/_common/day-bounds.js';

type Input = MyUITools['readFoodEntries']['input'];
type Output = MyUITools['readFoodEntries']['output'];

/** The most days one read covers, so a question about "everything" can't pull the whole diary. */
const MAX_DAYS = 31;

const round = (value: number) => Math.round(value * 10) / 10;
// Micronutrients are small (a few µg), so they keep more places than the macros do.
const roundFine = (value: number) => Math.round(value * 1000) / 1000;

type Nutrients = Record<string, number>;

/** The optional nutrients an entry has a value for, scaled to what was eaten and keyed without `_100g`. */
function extraNutrients(entry: Record<string, unknown>, scale: number): Nutrients {
	const result: Nutrients = {};
	for (const { key } of OPTIONAL_NUTRIENT_FIELDS) {
		const value = entry[key];
		if (typeof value === 'number') result[key.replace(/_100g$/, '')] = roundFine(value * scale);
	}
	return result;
}

/** The sum of each nutrient across `all`, counting only the entries that have it. */
function sumNutrients(all: Nutrients[]): Nutrients {
	const total: Nutrients = {};
	for (const nutrients of all)
		for (const [key, value] of Object.entries(nutrients)) total[key] = (total[key] ?? 0) + value;
	for (const key of Object.keys(total)) total[key] = roundFine(total[key]);
	return total;
}

/**
 * Answers the model's `readFoodEntries` call from the entries on this device, with each entry's
 * nutrients scaled to what was eaten and a total per day. Days with nothing logged are listed
 * empty, so the model can tell "none logged" from "not asked". With `detail: 'full'` each entry and
 * day also carries every optional nutrient that has a value (micronutrients, fiber, fat types...). Throws a message the model can act
 * on when the range is invalid.
 */
export async function readFoodEntries(
	userId: string,
	{ from: fromInput, to: toInput, detail }: Input
): Promise<Output> {
	if (!fromInput) throw new Error('A first day is required.');
	const from = parseDate(fromInput);
	const to = parseDate(toInput ?? fromInput);
	const days = to.compare(from) + 1;
	if (days < 1) throw new Error('The last day is before the first.');
	if (days > MAX_DAYS) throw new Error(`Ask for at most ${MAX_DAYS} days at a time.`);

	// A chat isn't a page's load, so nothing reruns this read.
	const entries = await getFoodEntriesByRange(() => {}, { userId, from, to });

	const byDay = new Map<string, Output['days'][number]['entries']>();
	for (let offset = 0; offset < days; offset++)
		byDay.set(from.add({ days: offset }).toString(), []);

	for (const entry of entries) {
		const scale = entry.quantityG / 100;
		byDay.get(localDay(entry.eatenAt))?.push({
			name: entry.productName,
			quantityG: round(entry.quantityG),
			meal: entry.meal?.name ?? null,
			kcal: round(entry.energyKcal_100g * scale),
			carbsG: round(entry.carbohydratesG_100g * scale),
			fatG: round(entry.fatG_100g * scale),
			proteinG: round(entry.proteinsG_100g * scale),
			...(detail === 'full' && { nutrients: extraNutrients(entry, scale) })
		});
	}

	return {
		days: [...byDay].map(([date, dayEntries]) => ({
			date,
			entries: dayEntries,
			totals: {
				kcal: round(dayEntries.reduce((sum, e) => sum + e.kcal, 0)),
				carbsG: round(dayEntries.reduce((sum, e) => sum + e.carbsG, 0)),
				fatG: round(dayEntries.reduce((sum, e) => sum + e.fatG, 0)),
				proteinG: round(dayEntries.reduce((sum, e) => sum + e.proteinG, 0)),
				...(detail === 'full' && {
					nutrients: sumNutrients(dayEntries.map((e) => e.nutrients ?? {}))
				})
			}
		}))
	};
}
