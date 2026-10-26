import type { CreateInput, DefaultModelRow, IncludedRow } from '@prisma-idb/client-idb/orm';
import type { Contract } from './generated/contract';

export type { Contract };
export { contractSpace } from './generated/contract-space.generated';

/** A stored row of model `M`, e.g. `Row<'Meal'>`. */
export type Row<M extends string> = DefaultModelRow<Contract, M>;
/** The input to `db.orm.<model>.create()`: fields with a schema default are optional. */
export type NewRow<M extends string> = CreateInput<Contract, M>;

export type FoodEntryWithMeal = IncludedRow<Contract, 'FoodEntry', { meal: true }>;
