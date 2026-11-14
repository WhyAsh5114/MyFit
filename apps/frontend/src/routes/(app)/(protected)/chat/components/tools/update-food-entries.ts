import type { MyUITools } from '@myfit/api';
import { OPTIONAL_NUTRIENT_FIELDS } from '@myfit/shared/nutrition';
import type { FoodEntryChanges } from '#lib/features/food-diary/food-entry/mutations/update-many.js';
import { getFoodEntriesByIds } from '#lib/features/food-diary/food-entry/queries/get-by-ids.js';
import { localDay } from '#lib/features/food-diary/_common/day-bounds.js';
import { localTime, parseLocalDateTime } from './local-time';

type Edit = MyUITools['updateFoodEntries']['input']['edits'][number];
type Output = MyUITools['updateFoodEntries']['output'];

/** What an entry is, before and after an edit, as the card shows it. */
export type EntryState = {
	name: string;
	quantityG: number;
	kcal: number;
	eatenAt: Date;
	meal: string | null;
	/** Per 100 g. */
	carbsG: number;
	fatG: number;
	proteinG: number;
	/** The optional nutrients per 100 g, by field key. */
	extras: Record<string, number | null>;
};

export type PlannedUpdate = {
	id: string;
	before: EntryState;
	after: EntryState;
	/** The fields to write; empty when the edit changes nothing the entry doesn't already have. */
	changes: FoodEntryChanges;
};

const kcal = (per100g: number, quantityG: number) => Math.round((per100g * quantityG) / 100);

/**
 * The edits a `updateFoodEntries` call asks for, read against the entries on this device rather
 * than taken from the model, so the card shows what will really change. Ids with no entry are
 * listed apart, and a meal name the user doesn't have leaves the meal as it is.
 */
export async function planUpdates(
	userId: string,
	edits: Edit[],
	meals: { id: string; name: string }[]
) {
	// A chat isn't a page's load, so nothing reruns this read.
	const entries = await getFoodEntriesByIds(() => {}, { userId, ids: edits.map((e) => e.id) });
	const byId = new Map(entries.map((entry) => [entry.id, entry]));

	const updates: PlannedUpdate[] = [];
	for (const edit of edits) {
		const entry = byId.get(edit.id);
		if (!entry) continue;
		byId.delete(edit.id); // a repeated id is applied once

		const changes: FoodEntryChanges = {};
		const set = <K extends keyof FoodEntryChanges>(key: K, value: FoodEntryChanges[K]) => {
			if (value !== undefined && value !== (entry as Record<string, unknown>)[key])
				changes[key] = value;
		};
		set('productName', edit.name);
		set('quantityG', edit.quantityG);
		set('energyKcal_100g', edit.energyKcal_100g);
		set('carbohydratesG_100g', edit.carbohydratesG_100g);
		set('fatG_100g', edit.fatG_100g);
		set('proteinsG_100g', edit.proteinsG_100g);
		const extras = (key: string, source: Record<string, unknown>) => {
			const value = source[key];
			return typeof value === 'number' ? value : null;
		};
		for (const { key } of OPTIONAL_NUTRIENT_FIELDS) {
			const value = (edit as Record<string, unknown>)[key];
			if (value === undefined) continue;
			if (value !== extras(key, entry)) (changes as Record<string, unknown>)[key] = value;
		}
		const extrasAfter = (source: Record<string, unknown>) =>
			Object.fromEntries(
				OPTIONAL_NUTRIENT_FIELDS.map(({ key }) => [
					key,
					key in changes
						? ((changes as Record<string, number | null>)[key] ?? null)
						: extras(key, source)
				])
			);

		const eatenAt = parseLocalDateTime(edit.eatenAt);
		if (eatenAt && eatenAt.getTime() !== entry.eatenAt.getTime()) changes.eatenAt = eatenAt;

		let mealName = entry.meal?.name ?? null;
		if (edit.meal !== undefined) {
			const meal =
				edit.meal === null
					? null
					: meals.find((m) => m.name.toLowerCase() === edit.meal?.trim().toLowerCase());
			if (meal !== undefined && (meal?.id ?? null) !== entry.mealId) {
				changes.mealId = meal?.id ?? null;
				mealName = meal?.name ?? null;
			}
		}

		const quantityG = changes.quantityG ?? entry.quantityG;
		updates.push({
			id: entry.id,
			before: {
				name: entry.productName,
				quantityG: entry.quantityG,
				kcal: kcal(entry.energyKcal_100g, entry.quantityG),
				eatenAt: entry.eatenAt,
				meal: entry.meal?.name ?? null,
				carbsG: entry.carbohydratesG_100g,
				fatG: entry.fatG_100g,
				proteinG: entry.proteinsG_100g,
				extras: Object.fromEntries(
					OPTIONAL_NUTRIENT_FIELDS.map(({ key }) => [key, extras(key, entry)])
				)
			},
			after: {
				name: changes.productName ?? entry.productName,
				quantityG,
				kcal: kcal(changes.energyKcal_100g ?? entry.energyKcal_100g, quantityG),
				eatenAt: changes.eatenAt ?? entry.eatenAt,
				meal: mealName,
				carbsG: changes.carbohydratesG_100g ?? entry.carbohydratesG_100g,
				fatG: changes.fatG_100g ?? entry.fatG_100g,
				proteinG: changes.proteinsG_100g ?? entry.proteinsG_100g,
				extras: extrasAfter(entry)
			},
			changes
		});
	}
	return {
		updates,
		notFound: [...new Set(edits.map((e) => e.id))].filter((id) => !updates.some((u) => u.id === id))
	};
}

/** What the model is told an entry is, once it is changed. */
export const summarizeUpdate = ({ after }: PlannedUpdate) =>
	({
		name: after.name,
		quantityG: Math.round(after.quantityG * 10) / 10,
		date: localDay(after.eatenAt),
		time: localTime(after.eatenAt),
		meal: after.meal
	}) satisfies Output['updated'][number];
