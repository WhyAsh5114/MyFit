import { AmphoraIcon, BeefIcon, FlameIcon, WheatIcon } from '@lucide/svelte';
import type { FoodEntry, NutritionData } from '@myfit/api/prisma/client';
import {
	OPTIONAL_NUTRIENT_FIELDS,
	REQUIRED_NUTRIENT_FIELDS,
	optionalNutrientsShape as sharedOptionalNutrientsShape
} from '@myfit/shared/nutrition';
import z from 'zod';

const REQUIRED_ICONS = {
	energyKcal_100g: FlameIcon,
	carbohydratesG_100g: WheatIcon,
	fatG_100g: AmphoraIcon,
	proteinsG_100g: BeefIcon
} as const satisfies Record<(typeof REQUIRED_NUTRIENT_FIELDS)[number]['key'], unknown>;

export const REQUIRED_NUTRIENTS = REQUIRED_NUTRIENT_FIELDS.map((n) => ({
	...n,
	icon: REQUIRED_ICONS[n.key]
})) satisfies Array<{
	key: keyof NutritionData & keyof FoodEntry;
	label: string;
	unit: string;
	icon: unknown;
}>;

export const OPTIONAL_NUTRIENTS = OPTIONAL_NUTRIENT_FIELDS satisfies ReadonlyArray<{
	key: keyof NutritionData & keyof FoodEntry;
	label: string;
	unit: string;
}>;

export const requiredNutrientsFields = REQUIRED_NUTRIENT_FIELDS.map((n) => ({
	key: n.key,
	label: n.label
}));

export const optionalNutrientsFields = OPTIONAL_NUTRIENT_FIELDS.map((n) => ({
	key: n.key,
	label: n.label
}));

export const requiredNutrientsShape = Object.fromEntries(
	REQUIRED_NUTRIENT_FIELDS.map((field) => [
		field.key,
		z
			.number()
			.nonnegative(`${field.label} must be non-negative`)
			.default('' as unknown as number)
	])
) as Record<(typeof REQUIRED_NUTRIENT_FIELDS)[number]['key'], z.ZodDefault<z.ZodNumber>>;

export const optionalNutrientsShape = sharedOptionalNutrientsShape;
