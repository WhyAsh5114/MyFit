import type { OPTIONAL_NUTRIENT_FIELDS, REQUIRED_NUTRIENT_FIELDS } from './fields';

type RequiredNutrientKey = (typeof REQUIRED_NUTRIENT_FIELDS)[number]['key'];
type OptionalNutrientKey = (typeof OPTIONAL_NUTRIENT_FIELDS)[number]['key'];

/**
 * A row of the Open Food Facts `NutritionData` search table, as served by the
 * API. The table lives outside the Prisma contract (it needs `tsvector` and
 * trigram indexes), so this is the one hand-written definition of its shape.
 */
export type NutritionData = {
	id: string;
	code: string;
	productName: string;
	brands: string | null;
	completeness: number;
	uniqueScans: number;
	servingQuantity: number | null;
	servingSize: string | null;
} & Record<RequiredNutrientKey, number> &
	Record<OptionalNutrientKey, number | null>;
