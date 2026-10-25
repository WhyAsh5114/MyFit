import type { ModelWritePolicies } from '@prisma-idb/sync-server-sql';

/** Keeps account lifecycle and authentication fields under Better Auth's control. */
export const writePolicies: ModelWritePolicies = {
	User: { operations: ['update'], writableFields: ['name', 'image', 'autoUpdate'] }
};
