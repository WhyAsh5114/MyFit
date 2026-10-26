import z from 'zod';
import { NUTRITION_DATA_SEARCH_MAX_OFFSET } from '@myfit/shared/constants';

/** Bound public pagination before the search reaches the database. */
export const nutritionSearchQuery = z.object({
	search: z.string().min(1, 'Search query cannot be empty').max(200),
	offset: z.coerce.number().int().min(0).max(NUTRITION_DATA_SEARCH_MAX_OFFSET).optional().default(0)
});
