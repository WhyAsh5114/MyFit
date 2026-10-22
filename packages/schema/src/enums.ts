// Runtime values for the schema's enums. The emitted contract only carries
// them as string-literal unions, so anything the UI iterates over lives here.
// `satisfies` ties each object to the contract's own union: adding a value to
// schema.prisma without updating this file is a type error.
import type { DefaultModelRow } from '@prisma-idb/client-idb/orm';
import type { Contract } from './contract';

type ActivityAdjustment = DefaultModelRow<Contract, 'ActivityPreferences'>['adjustmentType'];

export const ActivityAdjustmentType = {
	Static: 'Static',
	Dynamic: 'Dynamic',
	Manual: 'Manual'
} as const satisfies Record<ActivityAdjustment, ActivityAdjustment>;

export type ActivityAdjustmentType =
	(typeof ActivityAdjustmentType)[keyof typeof ActivityAdjustmentType];
