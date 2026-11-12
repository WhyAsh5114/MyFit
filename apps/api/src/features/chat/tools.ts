import type { InferUITools } from 'ai';
import { REQUIRED_NUTRIENT_FIELDS, OPTIONAL_NUTRIENT_FIELDS } from '@myfit/shared/nutrition';
import z from 'zod';
import { findFoods } from './search-foods-tool.js';
import { searchWeb } from './web-search.js';

type RequiredNutrientKey = (typeof REQUIRED_NUTRIENT_FIELDS)[number]['key'];
type OptionalNutrientKey = (typeof OPTIONAL_NUTRIENT_FIELDS)[number]['key'];

const coercedRequiredNutrientsShape = Object.fromEntries(
	REQUIRED_NUTRIENT_FIELDS.map((f) => [f.key, z.coerce.number().nonnegative()])
) as { [K in RequiredNutrientKey]: z.ZodNumber };

const coercedOptionalNutrientsShape = Object.fromEntries(
	OPTIONAL_NUTRIENT_FIELDS.map((f) => [
		f.key,
		z.coerce.number().nonnegative().optional().nullable()
	])
) as { [K in OptionalNutrientKey]: z.ZodNullable<z.ZodOptional<z.ZodNumber>> };

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the form YYYY-MM-DD.');

/** Amounts for the quantity eaten, already scaled from the per-100g values. */
const eatenNutrients = {
	kcal: z.number(),
	carbsG: z.number(),
	fatG: z.number(),
	proteinG: z.number()
};

/**
 * The optional nutrients (fats, sugars, fiber, salt, vitamins, minerals, caffeine) for the quantity
 * eaten, keyed like `vitaminCMg` or `ironMg`. Only nutrients with a known value are present.
 */
const extraNutrients = z.record(z.string(), z.number());

export const tools = {
	requireClarification: {
		description: 'Ask the user a clarifying question with multiple choice answers.',
		inputSchema: z.object({
			message: z.string().describe('The clarifying question to ask the user.'),
			choices: z
				.array(z.string())
				.describe('The multiple choice options for the user to pick from.')
		}),
		outputSchema: z.string()
	},
	createFoodEntry: {
		description:
			'Create a food entry for the user. Nutrient values are per 100 g, and quantityG is the amount eaten.',
		inputSchema: z.object({
			name: z.string().describe('The name of the food.'),
			brands: z
				.string()
				.optional()
				.nullable()
				.describe('The brand, when the food is a branded product (for example from searchFoods).'),
			quantityG: z.coerce.number().positive().describe('Amount eaten in grams.'),
			...coercedRequiredNutrientsShape,
			...coercedOptionalNutrientsShape
		}),
		outputSchema: z.string()
	},
	searchFoods: {
		description:
			"Search the Open Food Facts database of packaged and common foods by name and brand. Returns up to 5 matches with nutrients per 100 g and the serving size. Use it before estimating, and log a match's values when it is the food the user means.",
		inputSchema: z.object({
			query: z
				.string()
				.min(2)
				.max(120)
				.describe('Product name and brand words, for example "nescafe iced latte".')
		}),
		outputSchema: z.object({
			foods: z.array(
				z.object({
					name: z.string(),
					brands: z.string().nullable(),
					servingSize: z.string().nullable(),
					servingQuantityG: z.number().nullable(),
					per100g: z.record(z.string(), z.number())
				})
			)
		}),
		execute: ({ query }: { query: string }) => findFoods(query)
	},
	webSearch: {
		description:
			"Search the web. Use it for nutrition facts of a specific product, restaurant item or regional variant that searchFoods does not have, preferring the maker's own page. Returns pages with an excerpt of their text.",
		inputSchema: z.object({
			query: z.string().min(2).max(200).describe('What to search for.')
		}),
		outputSchema: z.object({
			results: z.array(z.object({ title: z.string(), url: z.string(), text: z.string() }))
		}),
		execute: ({ query }: { query: string }) => searchWeb(query)
	},
	readFoodEntries: {
		description:
			'Read the user\'s logged food entries, with the nutrients of each and the totals for each day. The app reads them on the user\'s device. Use it to answer questions about what they ate, their calories or macros, or how much is left, instead of guessing. By default it gives calories and macros only; set `detail` to "full" when the question is about micronutrients or other nutrients (vitamins, minerals, fiber, sugar, sodium, cholesterol, fat types, caffeine).',
		inputSchema: z.object({
			from: isoDate.describe("First day to read, as the user's local date."),
			to: isoDate
				.optional()
				.describe('Last day to read, inclusive. Defaults to `from`. At most 31 days after it.'),
			detail: z
				.enum(['macros', 'full'])
				.optional()
				.describe(
					'"macros" (default) gives calories, carbs, fat and protein. "full" also gives every other nutrient the entries have, per entry and per day.'
				)
		}),
		outputSchema: z.object({
			days: z.array(
				z.object({
					date: isoDate,
					entries: z.array(
						z.object({
							name: z.string(),
							quantityG: z.number(),
							meal: z.string().nullable(),
							...eatenNutrients,
							nutrients: extraNutrients.optional()
						})
					),
					totals: z.object({ ...eatenNutrients, nutrients: extraNutrients.optional() })
				})
			)
		})
	}
};

export type MyUITools = InferUITools<typeof tools>;
