import type { OPTIONAL_NUTRIENT_FIELDS, REQUIRED_NUTRIENT_FIELDS } from '@myfit/shared/nutrition';

type RequiredNutrientKey = (typeof REQUIRED_NUTRIENT_FIELDS)[number]['key'];
type OptionalNutrientKey = (typeof OPTIONAL_NUTRIENT_FIELDS)[number]['key'];

/**
 * A row of the Open Food Facts `NutritionData` search table, as served by the
 * API. The table remains outside the server contract; this shape also keeps
 * the frontend nutrition forms independent of a generated client.
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
