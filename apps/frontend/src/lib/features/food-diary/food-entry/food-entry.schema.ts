import z from 'zod';
import { REQUIRED_NUTRIENTS, OPTIONAL_NUTRIENTS } from './nutrients.js';

export const requiredFields = REQUIRED_NUTRIENTS.map((n) => ({
	key: n.key,
	label: n.label
}));

export const optionalFields = OPTIONAL_NUTRIENTS.map((n) => ({
	key: n.key,
	label: n.label
}));

const requiredShape = Object.fromEntries(
	requiredFields.map((field) => [
		field.key,
		z
			.number()
			.nonnegative(`${field.label} must be non-negative`)
			.default('' as unknown as number)
	])
) as Record<(typeof requiredFields)[number]['key'], z.ZodDefault<z.ZodNumber>>;

const optionalShape = Object.fromEntries(
	optionalFields.map((field) => [
		field.key,
		z.number().nonnegative(`${field.label} must be non-negative`).optional().nullable()
	])
) as Record<(typeof optionalFields)[number]['key'], z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;

export const foodEntryFormSchema = z.object({
	productName: z.string().min(1, 'Product name is required'),
	brands: z.string().nullable().optional(),
	eatenAt: z.date(),
	quantityG: z
		.number()
		.positive('Quantity must be greater than zero')
		.default('' as unknown as number),
	servingSize: z.string().nullable().optional(),
	servingQuantity: z.number().nullable().optional(),
	preferredUnit: z.enum(['g', 'serving']),
	meal: z.string().optional().nullable(),
	...requiredShape,
	...optionalShape
});

export type FoodEntryFormSchema = z.infer<typeof foodEntryFormSchema>;
