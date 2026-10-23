import type { CreateInput, DefaultModelRow, IncludedRow } from '@prisma-idb/client-idb/orm';
import type { Contract } from './contract';

export type { Contract };
export { contractSpace } from './contract-space.generated';

/** A stored row of model `M`, e.g. `Row<'Meal'>`. */
export type Row<M extends string> = DefaultModelRow<Contract, M>;
/** The input to `db.orm.<model>.create()`: fields with a schema default are optional. */
export type NewRow<M extends string> = CreateInput<Contract, M>;

export type Meal = Row<'Meal'>;
export type FoodEntry = Row<'FoodEntry'>;
export type ActivityEntry = Row<'ActivityEntry'>;
export type MacroMetrics = Row<'MacroMetrics'>;

export type FoodEntryWithMeal = IncludedRow<Contract, 'FoodEntry', { meal: true }>;
