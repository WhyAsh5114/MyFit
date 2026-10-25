import type { OPTIONAL_NUTRIENT_FIELDS, REQUIRED_NUTRIENT_FIELDS } from './fields';

type RequiredNutrientKey = (typeof REQUIRED_NUTRIENT_FIELDS)[number]['key'];
type OptionalNutrientKey = (typeof OPTIONAL_NUTRIENT_FIELDS)[number]['key'];

/**
 * A row of the Open Food Facts `NutritionData` search table, as served by the
 * API. The server contract owns the table; this hand-written copy keeps the
 * server-only contract types out of the browser bundle.
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
