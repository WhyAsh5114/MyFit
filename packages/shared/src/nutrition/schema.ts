import z from 'zod';
import { OPTIONAL_NUTRIENT_FIELDS, REQUIRED_NUTRIENT_FIELDS } from './fields';

export const requiredNutrientsShape = Object.fromEntries(
	REQUIRED_NUTRIENT_FIELDS.map((field) => [
		field.key,
		z.number().nonnegative(`${field.label} must be non-negative`)
	])
) as Record<(typeof REQUIRED_NUTRIENT_FIELDS)[number]['key'], z.ZodNumber>;

export const optionalNutrientsShape = Object.fromEntries(
	OPTIONAL_NUTRIENT_FIELDS.map((field) => [
		field.key,
		z.number().nonnegative(`${field.label} must be non-negative`).optional().nullable()
	])
) as Record<
	(typeof OPTIONAL_NUTRIENT_FIELDS)[number]['key'],
	z.ZodNullable<z.ZodOptional<z.ZodNumber>>
>;
