import type { MyUITools } from '@myfit/api';
import { noDepends } from '#lib/data/dependencies.js';
import { forQuantity } from '#lib/domain/nutrition/portion.js';
import { getFoodEntriesByIds } from '#lib/features/food-diary/food-entry/queries/get-by-ids.js';
import { localDay } from '#lib/features/food-diary/_common/day-bounds.js';
import { localTime } from './local-time.js';

type Output = MyUITools['deleteFoodEntries']['output'];

/** An entry the model asked to delete, as the card shows it. */
export type EntryToDelete = {
	id: string;
	name: string;
	quantityG: number;
	kcal: number;
	eatenAt: Date;
	meal: string | null;
};

/**
 * The entries a `deleteFoodEntries` call names, read from this device rather than taken from the
 * model, so the card shows what will really be deleted. Ids with no entry are listed apart.
 */
export async function findEntriesToDelete(userId: string, ids: string[]) {
	const entries = await getFoodEntriesByIds(noDepends, { userId, ids });
	const found = new Set(entries.map((entry) => entry.id));
	return {
		entries: entries
			.toSorted((a, b) => a.eatenAt.getTime() - b.eatenAt.getTime())
			.map((entry): EntryToDelete => ({
				id: entry.id,
				name: entry.productName,
				quantityG: entry.quantityG,
				kcal: Math.round(forQuantity(entry.energyKcal_100g, entry.quantityG)),
				eatenAt: entry.eatenAt,
				meal: entry.meal?.name ?? null
			})),
		notFound: [...new Set(ids)].filter((id) => !found.has(id))
	};
}

/** What the model is told an entry was, once it is deleted. */
export const summarize = (entry: Pick<EntryToDelete, 'name' | 'quantityG' | 'eatenAt'>) =>
	({
		name: entry.name,
		quantityG: Math.round(entry.quantityG * 10) / 10,
		date: localDay(entry.eatenAt),
		time: localTime(entry.eatenAt)
	}) satisfies Output['deleted'][number];
