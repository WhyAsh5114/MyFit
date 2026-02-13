import z from 'zod';

export const requiredFields = [
	{ key: 'energy_kcal_100g', label: 'Calories (kcal)' },
	{ key: 'carbohydrates_100g', label: 'Carbs (g)' },
	{ key: 'fat_100g', label: 'Fat (g)' },
	{ key: 'proteins_100g', label: 'Protein (g)' }
] as const;

export const optionalFields = [
	{ key: 'saturated_fat_100g', label: 'Saturated fat (g)' },
	{ key: 'unsaturated_fat_100g', label: 'Unsaturated fat (g)' },
	{ key: 'monounsaturated_fat_100g', label: 'Monounsaturated fat (g)' },
	{ key: 'polyunsaturated_fat_100g', label: 'Polyunsaturated fat (g)' },
	{ key: 'trans_fat_100g', label: 'Trans fat (g)' },
	{ key: 'cholesterol_100g', label: 'Cholesterol (mg)' },
	{ key: 'sugars_100g', label: 'Sugars (g)' },
	{ key: 'polyols_100g', label: 'Polyols (g)' },
	{ key: 'fiber_100g', label: 'Fiber (g)' },
	{ key: 'salt_100g', label: 'Salt (g)' },
	{ key: 'sodium_100g', label: 'Sodium (mg)' },
	{ key: 'alcohol_100g', label: 'Alcohol (g)' },
	{ key: 'vitamin_a_100g', label: 'Vitamin A (IU)' },
	{ key: 'vitamin_d_100g', label: 'Vitamin D (IU)' },
	{ key: 'vitamin_e_100g', label: 'Vitamin E (mg)' },
	{ key: 'vitamin_k_100g', label: 'Vitamin K (µg)' },
	{ key: 'vitamin_c_100g', label: 'Vitamin C (mg)' },
	{ key: 'vitamin_b1_100g', label: 'Vitamin B1 (mg)' },
	{ key: 'vitamin_b2_100g', label: 'Vitamin B2 (mg)' },
	{ key: 'vitamin_b6_100g', label: 'Vitamin B6 (mg)' },
	{ key: 'vitamin_b9_100g', label: 'Vitamin B9 (µg)' },
	{ key: 'folates_100g', label: 'Folates (µg)' },
	{ key: 'vitamin_b12_100g', label: 'Vitamin B12 (µg)' },
	{ key: 'potassium_100g', label: 'Potassium (mg)' },
	{ key: 'calcium_100g', label: 'Calcium (mg)' },
	{ key: 'phosphorus_100g', label: 'Phosphorus (mg)' },
	{ key: 'iron_100g', label: 'Iron (mg)' },
	{ key: 'magnesium_100g', label: 'Magnesium (mg)' },
	{ key: 'zinc_100g', label: 'Zinc (mg)' },
	{ key: 'copper_100g', label: 'Copper (mg)' },
	{ key: 'manganese_100g', label: 'Manganese (mg)' },
	{ key: 'caffeine_100g', label: 'Caffeine (mg)' }
] as const;

const requiredShape = Object.fromEntries(
	requiredFields.map((field) => [
		field.key,
		z.coerce.number().nonnegative(`${field.label} must be non-negative`)
	])
) as Record<(typeof requiredFields)[number]['key'], z.ZodNumber>;

const optionalShape = Object.fromEntries(
	optionalFields.map((field) => [
		field.key,
		z.coerce.number().nonnegative(`${field.label} must be non-negative`).nullable()
	])
) as Record<(typeof optionalFields)[number]['key'], z.ZodNullable<z.ZodNumber>>;

export const foodEntryFormSchema = z.object({
	productName: z.string().min(1, 'Product name is required'),
	brands: z.string().nullable(),
	eatenAt: z.date(),
	quantityG: z.number().positive('Quantity must be greater than zero'),
	...requiredShape,
	...optionalShape
});

export type FoodEntryFormSchema = z.infer<typeof foodEntryFormSchema>;
