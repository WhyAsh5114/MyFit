import { AmphoraIcon, BeefIcon, FlameIcon, WheatIcon } from '@lucide/svelte';
import type { Row } from '@myfit/shared/client';
import type { NutritionData } from '@myfit/shared/nutrition';
import { OPTIONAL_NUTRIENT_FIELDS, REQUIRED_NUTRIENT_FIELDS } from '@myfit/shared/nutrition';
import z from 'zod';
import { m } from '#lib/paraglide/messages.js';
import { EMPTY_NUMBER } from './empty-number.js';

type RequiredKey = (typeof REQUIRED_NUTRIENT_FIELDS)[number]['key'];
type OptionalKey = (typeof OPTIONAL_NUTRIENT_FIELDS)[number]['key'];
export type NutrientKey = RequiredKey | OptionalKey;

/** A nutrient's name in the app's language. The `label` in the shared fields is for the model. */
export const nutrientLabel = (key: NutrientKey) => m[`nutrient.${key}`]();

const REQUIRED_ICONS = {
	energyKcal_100g: FlameIcon,
	carbohydratesG_100g: WheatIcon,
	fatG_100g: AmphoraIcon,
	proteinsG_100g: BeefIcon
} as const satisfies Record<RequiredKey, unknown>;

export const REQUIRED_NUTRIENTS = REQUIRED_NUTRIENT_FIELDS.map(({ key, unit }) => ({
	key,
	unit,
	icon: REQUIRED_ICONS[key]
})) satisfies Array<{ key: keyof NutritionData & keyof Row<'FoodEntry'>; unit: string }>;

export const OPTIONAL_NUTRIENTS = OPTIONAL_NUTRIENT_FIELDS.map(({ key, unit }) => ({
	key,
	unit
})) satisfies Array<{ key: keyof NutritionData & keyof Row<'FoodEntry'>; unit: string }>;

const nonNegative = () => z.number().nonnegative({ error: () => m['validation.nonNegative']() });

// `Object.fromEntries` types its result as a plain record, so the keys are restated here.
export const requiredNutrientsShape = Object.fromEntries(
	REQUIRED_NUTRIENT_FIELDS.map(({ key }) => [key, nonNegative().default(EMPTY_NUMBER)])
) as Record<RequiredKey, z.ZodDefault<z.ZodNumber>>;

export const optionalNutrientsShape = Object.fromEntries(
	OPTIONAL_NUTRIENT_FIELDS.map(({ key }) => [key, nonNegative().optional().nullable()])
) as Record<OptionalKey, z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
