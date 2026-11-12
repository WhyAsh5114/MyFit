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

/** A wall-clock time in the user's own time zone, without an offset. */
const localDateTime = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Use the form YYYY-MM-DDTHH:mm, in local time.');

/** An entry as the user recognizes it, for the model's answer after a delete. */
const entrySummary = z.object({
	name: z.string(),
	quantityG: z.number(),
	date: isoDate,
	time: z.string()
});

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
			'Propose a food entry. The user sees a card with the values and the meal, can change the meal, and confirms it. Nutrient values are per 100 g.',
		inputSchema: z.object({
			name: z.string().describe('The name of the food.'),
			brands: z
				.string()
				.optional()
				.nullable()
				.describe('The brand, when the food is a branded product (for example from searchFoods).'),
			meal: z
				.string()
				.optional()
				.nullable()
				.describe(
					"One of the user's meal names, exactly as listed. Use the meal the user named, otherwise the one that fits their local time. Leave it out when they have no meals."
				),
			quantityG: z.coerce.number().positive().describe('Amount eaten in grams.'),
			eatenAt: localDateTime
				.optional()
				.nullable()
				.describe(
					'When it was eaten, as the user\'s local date and time (YYYY-MM-DDTHH:mm). Leave it out for "now"; set it only when the user says when ("yesterday", "at 8 am", "last night").'
				),
			...coercedRequiredNutrientsShape,
			...coercedOptionalNutrientsShape
		}),
		outputSchema: z.object({
			logged: z.boolean(),
			/** The meal the user logged it under, which can differ from the proposed one. */
			meal: z.string().nullable()
		})
	},
	deleteFoodEntries: {
		description:
			'Propose deleting logged food entries, by the ids readFoodEntries gives. The user sees every entry on one card and confirms them all with one tap, or cancels. Put every entry to delete in one call. Never delete without reading the entries first, and never guess an id.',
		inputSchema: z.object({
			ids: z.array(z.string()).min(1).max(50).describe('The ids of the entries to delete.')
		}),
		outputSchema: z.object({
			/** What was deleted; empty when the user cancelled or none of the ids exist. */
			deleted: z.array(entrySummary),
			cancelled: z.boolean(),
			/** Ids that match no entry of the user's. */
			notFound: z.array(z.string())
		})
	},
	updateFoodEntries: {
		description:
			'Propose changes to logged food entries, by the ids readFoodEntries gives. The user sees each entry with its old and new values on one card and confirms them all with one tap, or cancels. Put every change in one call. Set only the fields that change. Never edit without reading the entries first, and never guess an id.',
		inputSchema: z.object({
			edits: z
				.array(
					z.object({
						id: z.string().describe('The id of the entry to change.'),
						name: z.string().min(1).optional().describe('A new name.'),
						quantityG: z.coerce.number().positive().optional().describe('A new amount in grams.'),
						meal: z
							.string()
							.nullable()
							.optional()
							.describe(
								"One of the user's meal names, exactly as listed, or null to take it out of its meal."
							),
						eatenAt: localDateTime.optional().describe('A new time it was eaten, in local time.'),
						energyKcal_100g: z.coerce.number().nonnegative().optional(),
						carbohydratesG_100g: z.coerce.number().nonnegative().optional(),
						fatG_100g: z.coerce.number().nonnegative().optional(),
						proteinsG_100g: z.coerce.number().nonnegative().optional()
					})
				)
				.min(1)
				.max(50)
		}),
		outputSchema: z.object({
			/** The entries as they are now; empty when the user cancelled or none of the ids exist. */
			updated: z.array(entrySummary.extend({ meal: z.string().nullable() })),
			cancelled: z.boolean(),
			/** Ids that match no entry of the user's. */
			notFound: z.array(z.string())
		})
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
							id: z.string(),
							/** The local time it was eaten, HH:mm. */
							time: z.string(),
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
