import type { IdbOrmTransaction } from '@prisma-idb/client-idb/client';
import type { Contract } from '@myfit/shared/client';
import type { MealsFormSchema } from './schema';

type Tx = IdbOrmTransaction<Contract, 'meal'>;

/** Where a meal waits while the names of the meals around it are being rearranged. */
const placeholder = (id: string) => `\u0000${id}`;

/**
 * Makes the user's meals match the submitted list, in its order. Meals are matched by `id`, so a
 * renamed meal stays the same row and its entries stay with it. A meal missing from the list is
 * archived, not deleted, because its entries still point at it. A new meal whose name an archived
 * meal already holds brings that meal back, and a renamed meal that takes an archived meal's name
 * moves that meal aside, because names are unique per user.
 *
 * Run it in a transaction over the `meal` store.
 */
export async function saveMeals(tx: Tx, userId: string, meals: MealsFormSchema['meals']) {
	const existing = await tx.meal.where({ userId }).all();
	const rows = new Map(existing.map((meal) => [meal.id, { ...meal }]));
	const idByName = new Map(existing.map((meal) => [meal.name, meal.id]));
	const submittedIds = new Set(meals.map((meal) => meal.id));

	async function rename(id: string, name: string) {
		const row = rows.get(id)!;
		if (row.name === name) return;
		await tx.meal.where({ id }).update({ name });
		idByName.delete(row.name);
		idByName.set(name, id);
		row.name = name;
	}

	for (const meal of existing) {
		if (meal.active && !submittedIds.has(meal.id)) {
			await tx.meal.where({ id: meal.id }).update({ active: false });
		}
	}

	// Free every name that is about to change first, so two meals can swap names.
	for (const meal of meals) {
		if (rows.has(meal.id) && rows.get(meal.id)!.name !== meal.name) {
			await rename(meal.id, placeholder(meal.id));
		}
	}

	for (const [index, meal] of meals.entries()) {
		const holder = idByName.get(meal.name);

		if (rows.has(meal.id)) {
			if (holder && holder !== meal.id) {
				await rename(holder, `${meal.name} (archived ${holder.slice(0, 8)})`);
			}
			await rename(meal.id, meal.name);
			await tx.meal.where({ id: meal.id }).update({ sortOrder: index, active: true });
		} else if (holder) {
			await tx.meal.where({ id: holder }).update({ sortOrder: index, active: true });
		} else {
			const created = await tx.meal.create({
				id: meal.id,
				name: meal.name,
				userId,
				sortOrder: index,
				active: true
			});
			rows.set(created.id, { ...created });
			idByName.set(created.name, created.id);
		}
	}
}
