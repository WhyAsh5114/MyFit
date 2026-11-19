import type { Row } from '@myfit/shared/client';
import { KCAL_PER_GRAM } from './constants.js';
import { forQuantity } from './portion.js';
import type { NutritionStatus } from './status.js';

/**
 * The micronutrients the day summary shows, in display order. A floor is a minimum to reach and a
 * ceiling a limit to stay under. `perStored` converts the stored per-100 g unit to `unit`: vitamin D
 * is stored in IU, and 40 IU is 1 µg.
 */
export const MICRONUTRIENTS = [
	{ key: 'fiberG_100g', unit: 'g', limit: 'floor', perStored: 1 },
	{ key: 'sodiumMg_100g', unit: 'mg', limit: 'ceiling', perStored: 1 },
	{ key: 'potassiumMg_100g', unit: 'mg', limit: 'floor', perStored: 1 },
	{ key: 'saturatedFatG_100g', unit: 'g', limit: 'ceiling', perStored: 1 },
	{ key: 'calciumMg_100g', unit: 'mg', limit: 'floor', perStored: 1 },
	{ key: 'ironMg_100g', unit: 'mg', limit: 'floor', perStored: 1 },
	{ key: 'magnesiumMg_100g', unit: 'mg', limit: 'floor', perStored: 1 },
	{ key: 'vitaminCMg_100g', unit: 'mg', limit: 'floor', perStored: 1 },
	{ key: 'vitaminDIU_100g', unit: 'µg', limit: 'floor', perStored: 1 / 40 },
	{ key: 'vitaminB12Mcg_100g', unit: 'µg', limit: 'floor', perStored: 1 }
] as const;

export type MicronutrientKey = (typeof MICRONUTRIENTS)[number]['key'];

type Entry = Pick<Row<'FoodEntry'>, MicronutrientKey | 'quantityG'>;
type Person = Pick<Row<'MacroMetrics'>, 'age' | 'gender'>;

export type MicronutrientRow = (typeof MICRONUTRIENTS)[number] & {
	/** The amount eaten, in `unit`. A food without a value for this nutrient adds nothing. */
	amount: number;
	/** The reference intake in `unit`, or null without body metrics. */
	reference: number | null;
	status: NutritionStatus;
};

type Band = '14-18' | '19-30' | '31-50' | '51-70' | '71+';

/** The DRI life-stage band. Younger users get the 14–18 values, the youngest band MyFit uses. */
function band(age: number): Band {
	if (age <= 18) return '14-18';
	if (age <= 30) return '19-30';
	if (age <= 50) return '31-50';
	if (age <= 70) return '51-70';
	return '71+';
}

/** A value per band for men and for women: [14–18, 19–30, 31–50, 51–70, 71+]. */
type ByBand = Record<
	Row<'MacroMetrics'>['gender'],
	readonly [number, number, number, number, number]
>;
const BANDS: Band[] = ['14-18', '19-30', '31-50', '51-70', '71+'];

/**
 * US Dietary Reference Intakes (National Academies): the RDA, or the AI where no RDA exists
 * (potassium, fibre). They depend on age and sex, not body weight.
 */
const BY_BAND: Record<
	Exclude<MicronutrientKey, 'fiberG_100g' | 'saturatedFatG_100g' | 'sodiumMg_100g'>,
	ByBand
> = {
	potassiumMg_100g: {
		Male: [3000, 3400, 3400, 3400, 3400],
		Female: [2300, 2600, 2600, 2600, 2600]
	},
	calciumMg_100g: { Male: [1300, 1000, 1000, 1000, 1200], Female: [1300, 1000, 1000, 1200, 1200] },
	ironMg_100g: { Male: [11, 8, 8, 8, 8], Female: [15, 18, 18, 8, 8] },
	magnesiumMg_100g: { Male: [410, 400, 420, 420, 420], Female: [360, 310, 320, 320, 320] },
	vitaminCMg_100g: { Male: [75, 90, 90, 90, 90], Female: [65, 75, 75, 75, 75] },
	vitaminDIU_100g: { Male: [15, 15, 15, 15, 20], Female: [15, 15, 15, 15, 20] },
	vitaminB12Mcg_100g: { Male: [2.4, 2.4, 2.4, 2.4, 2.4], Female: [2.4, 2.4, 2.4, 2.4, 2.4] }
};

/** The DRI's fibre AI is 14 g for every 1,000 kcal eaten. */
const FIBER_G_PER_KCAL = 14 / 1000;
/** Sodium's Chronic Disease Risk Reduction intake, for everyone 14 and older. */
const SODIUM_LIMIT_MG = 2300;
/** Dietary Guidelines for Americans: saturated fat under 10% of calories. */
const SATURATED_FAT_SHARE = 0.1;

/** The reference intake for one micronutrient, in its display unit. */
export function micronutrientReference(
	key: MicronutrientKey,
	person: Person,
	dayKcal: number
): number {
	switch (key) {
		case 'fiberG_100g':
			return dayKcal * FIBER_G_PER_KCAL;
		case 'saturatedFatG_100g':
			return (dayKcal * SATURATED_FAT_SHARE) / KCAL_PER_GRAM.fat;
		case 'sodiumMg_100g':
			return SODIUM_LIMIT_MG;
		default:
			return BY_BAND[key][person.gender][BANDS.indexOf(band(person.age))];
	}
}

/**
 * Only certain facts get a status, on any day: a floor that is met, or a ceiling that is passed.
 * Being under is never judged, because many foods have no micronutrient data and the totals run low.
 */
export function micronutrientStatus(
	limit: 'floor' | 'ceiling',
	amount: number,
	reference: number | null
): NutritionStatus {
	if (reference === null || reference <= 0) return { kind: 'neutral' };
	const ratio = amount / reference;
	if (limit === 'floor') return ratio >= 1 ? { kind: 'on-target' } : { kind: 'neutral' };
	if (ratio > 1)
		return { kind: 'off-target', direction: 'over', severity: ratio > 1.1 ? 'far' : 'slight' };
	return { kind: 'neutral' };
}

/**
 * Each micronutrient eaten across `entries`, against its reference. References need body metrics
 * and the day's calorie target, so without them every `reference` is null.
 */
export function micronutrientSummary(
	entries: Entry[],
	person: Person | null,
	dayKcal: number | null
): MicronutrientRow[] {
	return MICRONUTRIENTS.map((nutrient) => {
		let amount = 0;
		for (const entry of entries) {
			amount += forQuantity(entry[nutrient.key] ?? 0, entry.quantityG) * nutrient.perStored;
		}
		const reference =
			person && dayKcal !== null ? micronutrientReference(nutrient.key, person, dayKcal) : null;
		return {
			...nutrient,
			amount,
			reference,
			status: micronutrientStatus(nutrient.limit, amount, reference)
		};
	});
}
